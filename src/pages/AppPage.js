import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Header from "../components/Header";
import Body from "../components/Body";
import Footer from "../components/Footer";

const AppPage = () => {

  return (
    <>
      <Row>
	<Col><Header /></Col>
      </Row>
      <Row>
	<Col><Body /></Col>
      </Row>
      <Row>
	<Col><Footer /></Col>
      </Row>
    </>
  );

};

export default AppPage;
