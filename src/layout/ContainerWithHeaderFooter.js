import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ContainerWithHeaderFooter = ({ children, className }) => {
  return (
    <Container className="Root mt-3">
      <Row>
        <Col>
          <Header />
        </Col>
      </Row>
      <Row className="pt-3">
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
