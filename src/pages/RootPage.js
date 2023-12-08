import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import EventApps from '../components/EventApps';
import Footer from '../components/Footer';

const RootPage = () => {
  return (
    <>
      <EventApps />
      <Row>
        <Col>
          <Footer />
        </Col>
      </Row>
    </>
  );
};

export default RootPage;
