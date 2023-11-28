import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Header from '../components/Header';
import ProfileView from '../components/Profile/ProfileView';
import Footer from '../components/Footer';

const ProfilePage = () => {
  return (
    <>
      <Row>
        <Col>
          <Header />
        </Col>
      </Row>
      <Row>
        <Col>
          <ProfileView />
        </Col>
      </Row>
      <Row>
        <Col>
          <Footer />
        </Col>
      </Row>
    </>
  );
};

export default ProfilePage;
