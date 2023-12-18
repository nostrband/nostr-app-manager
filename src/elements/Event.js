import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import EventNote from './EventNote';
import Profile from './Profile';
import EventProfile from './EventProfile';
import { nip19 } from '@nostrband/nostr-tools';
import EventUsers from './EventUsers';
import * as cmn from '../common.js';

const Event = (props) => {
  const event = props.event;
  const [showDetails, setShowDetails] = useState(false);

  function extractTitleAndBody(event) {
    let title;
    let body;

    try {
      const contentData = JSON.parse(event.content);
      title = contentData.name || contentData.display_name;
      body = contentData.about;
    } catch (e) {
      console.log('Error parsing JSON for event', event);
    }

    if (!title) {
      title = event.tags?.find(
        (tag) => tag[0] === 'title' || tag[0] === 'name'
      )?.[1];
    }
    if (!title) {
      title = event.tags?.find((tag) => tag[0] === 'd')?.[1];
    }

    if (!body) {
      body = event.tags?.find(
        (tag) =>
          tag[0] === 'description' || tag[0] === 'summary' || tag[0] === 'alt'
      )?.[1];
    }

    switch (event.kind) {
      case 0:
      case 31990:
        body = body || JSON.parse(event.content).about;
        break;
      case 30023:
        body = body || event.content.substring(0, 100);
        break;
      default:
        body = body || event.content;
    }

    return { title, body };
  }
  const { title, body } = extractTitleAndBody(event);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const processNip05 = (nip05) => {
    if (nip05 && nip05.startsWith('_@')) {
      return nip05.slice(2);
    }
    return nip05;
  };

  const updatedMeta = {
    ...event.meta,
    profile: {
      ...event.meta.profile,
      nip05: processNip05(event.meta.profile?.nip05),
    },
  };

  switch (event.kind) {
    case 0:
      return <EventProfile event={event} />;
    case 1:
      return <EventNote event={event} />;
    default:
      return (
        <Container className="ps-0 pe-0">
          <Profile removeLink profile={updatedMeta} pubkey={event.pubkey} />
          <Row className="pt-2">
            <Col xs={12}>
              <h3>{title}</h3>
              <p>
                {body.length > 1000 ? body.substring(0, 1000) + '...' : body}
              </p>
            </Col>

            {event.kind === 3 ||
            event.kind === 30000 ||
            event.kind === 40000 ? (
              <EventUsers users={props.users} event={event} />
            ) : null}

            {event.kind === 34550 ? (
              <>
                <strong className="mb-1">Moderators:</strong>
                <EventUsers users={{ users: props.moderators }} event={event} />
              </>
            ) : null}

            <Col xs={12}>
              <small className="text-muted">
                {cmn.getKindLabel(event.kind)
                  ? cmn.capitalizeFirstLetter(cmn.getKindLabel(event.kind))
                  : event.kind}
                <span className="mx-1">
                  {new Date(event.created_at * 1000).toLocaleString()}
                </span>
                <spans
                  onClick={toggleDetails}
                  className="ms-2 fs-7 pointer"
                  style={{ textDecoration: 'underline' }}
                >
                  {showDetails ? 'Less info' : 'More info'}
                </spans>
              </small>
            </Col>

            {showDetails && (
              <Col xs={12}>
                <small className="text-muted">
                  <div
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    Id: <b>{nip19.noteEncode(event.id)}</b>
                  </div>
                  <div>
                    Kind: <b>{event.kind}</b>
                  </div>
                </small>
              </Col>
            )}
          </Row>
        </Container>
      );
  }
};

export default Event;
