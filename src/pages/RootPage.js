import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Footer from '../components/Footer';
import EventApps from '../components/EventApps/EventApps';

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
