import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Profile from './Profile';

const EventNote = (props) => {
  const event = props.event;
  const author = event.meta;
  return (
    <Container className="ps-0 pe-0">
      <Profile removeLink profile={author} pubkey={event.pubkey} />
      <Row>
        <Col xs={12}>{event.content}</Col>
        <Col xs={12}>
          <small className="text-muted">
            {new Date(event.created_at * 1000).toLocaleString()}
          </small>
        </Col>
      </Row>
    </Container>
  );
};

export default EventNote;
