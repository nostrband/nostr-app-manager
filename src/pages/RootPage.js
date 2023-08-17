import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Index from '../components/Index';

const RootPage = () => {
  return (
    <>
      <Row>
        <Col>
          <Header />
        </Col>
      </Row>
      <Row>
        <Col>
          <Index />
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

export default RootPage;
