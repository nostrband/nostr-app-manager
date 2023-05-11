import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const Profile = (props) => {
  const p = props.profile;
  return (
      <Row className="mb-2">
      <Col xs="auto">
      <img width="64" height="64" src={p?.image} className="profile" /></Col>
      <Col>
      <div><b>{p.displayName || p.name}</b></div>
      <div><small className="text-muted">{p?.nip05}</small></div>
      </Col>
      </Row>
  );
}

export default Profile;
