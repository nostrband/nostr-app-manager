import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Header from "../components/Header";
import AppEditView from "../components/AppEditView";
import Footer from "../components/Footer";

const AppEditPage = () => {

  return (
    <>
      <Row>
	<Col><Header /></Col>
      </Row>
      <Row>
	<Col><AppEditView /></Col>
      </Row>
      <Row>
	<Col><Footer /></Col>
      </Row>
    </>
  );

};

export default AppEditPage;
