import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { Container } from 'react-bootstrap';

const ContainerWithHeaderFooter = ({ children }) => {
  return (
    <Container className="Root mt-3">
      <Row>
        <Col>
          <Header />
        </Col>
      </Row>
      <Row>
        <Col>{children}</Col>
      </Row>
      <Row>
        <Col>
          <Footer />
        </Col>
      </Row>
    </Container>
  );
};

export default ContainerWithHeaderFooter;
