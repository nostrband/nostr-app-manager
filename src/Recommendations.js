import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';

import './Recommendations.scss';

import Header from "./components/Header";
import Footer from "./components/Footer";

function Recommendations() {
  
  return(
    <Container className="Recommendations mt-5">
      <Row>
        <Col><Header /></Col>
      </Row>
      <Row className="mt-5">
        <Col>

	  <h1>Recommendations</h1>

	  <p>Everyone on Nostr can have a list of apps they use.</p>

	  <p>We call these lists <i>app recommendations</i> (<Link to="https://github.com/nostr-protocol/nips/pull/530">NIP-89</Link>).</p>

	  <p>The beauty of Nostr is that given these recommendations, apps can be discovered naturally.</p>

	  <p>You don't have to go to a centalized app store to find a new app. Instead, any client you're using can suggest new apps based on these recommendations.</p>

	  <p>If you've logged in, this Nostr App Manager will publish an app recommendation on your behalf whenever you choose an app to view some event.</p>

	  <p>By participating with your app recommendations, you're providing the signal for a completely new app discovery mechanism.</p>

	  <p>We really appreciate your contribution!</p>
	</Col>
      </Row>
      <Row>
        <Col><Footer /></Col>
      </Row>
    </Container>
  )
}

export default Recommendations;
