import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Header from '../components/Header';
import AppInfoView from '../components/App/AppInfoView';
import Footer from '../components/Footer';

const AppInfoPage = () => {
  return (
    <>
      <Row>
        <Col>
          <Header />
        </Col>
      </Row>
      <Row>
        <Col>
          <AppInfoView />
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

export default AppInfoPage;
