import React, { useState } from 'react';
import { Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import Profile from './Profile';
import * as cmn from '../common';
import { nip19 } from '@nostrband/nostr-tools';

const EventUsers = ({ event, users }) => {
  const [showDetails, setShowDetails] = useState(false);
  let titleEvent = event?.tags
    ?.filter((tag) => tag[0] === 'name')
    ?.map((tag) => tag[1])[0];

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <>
      <h3>{titleEvent}</h3>
      <ListGroup className="mb-1">
        {users?.users?.map((user) => {
          let profile = user?.content
            ? cmn.convertContentToProfile([user])
            : {};
          return (
            <ListGroupItem className="darked">
              <Profile
                key={user.id}
                profile={{ profile }}
                pubkey={user.pubkey}
                small={true}
              />
            </ListGroupItem>
          );
        })}
      </ListGroup>
      {users.countOfOtherUsers > 0 ? (
        <span>
          And <strong>{users.countOfOtherUsers}</strong> more profiles
        </span>
      ) : null}
      <Col className="mt-1" xs={12}>
        <small className="text-muted">
          {new Date(event.created_at * 1000).toLocaleString()}
          <span
            onClick={toggleDetails}
            className="ms-2 fs-7 pointer"
            style={{ textDecoration: 'underline' }}
          >
            {showDetails ? 'Less info' : 'More info'}
          </span>
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
    </>
  );
};

export default EventUsers;
