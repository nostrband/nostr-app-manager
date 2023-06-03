import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Header from "../components/Header";
import EventApps from "../components/EventApps";
import Footer from "../components/Footer";

const RootPage = () => {

  return (
    <>
      <Row>
	<Col><Header /></Col>
      </Row>
      <Row>
	<Col><EventApps /></Col>
      </Row>
      <Row>
	<Col><Footer /></Col>
      </Row>
    </>
  );

};

export default RootPage;
