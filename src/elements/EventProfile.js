import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Profile from './Profile';
import * as cmn from '../common';

const EventProfile = (props) => {
  const event = props.event;
  const author = event.meta;
  let profile = author;
  try {
    profile = JSON.parse(event.content);
  } catch (e) {
    console.log(e);
  }
  return (
    <Container className="ps-0 pe-0">
      <Profile removeLink profile={author} pubkey={event.pubkey} />
      <Row>
        <Col xs={12}>{profile?.about}</Col>
        {profile?.website && (
          <Col xs={12}>
            Website: <a href={profile.website}>{profile.website}</a>
          </Col>
        )}
        <Col xs={12}>
          {cmn.getKindLabel(event.kind)
            ? cmn.capitalizeFirstLetter(cmn.getKindLabel(event.kind))
            : event.kind}
          <span className="mx-2">
            {new Date(event.created_at * 1000).toLocaleString()}
          </span>
        </Col>
      </Row>
    </Container>
  );
};

export default EventProfile;
