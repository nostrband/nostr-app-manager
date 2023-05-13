import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import './About.scss';

import Header from "./components/Header";
import Footer from "./components/Footer";

function About() {
  
  return(
    <Container className="About mt-5">
      <Row>
        <Col><Header /></Col>
      </Row>
      <Row className="mt-5">
        <Col>
	  <p>Every day new apps are created by awesome Nostr devs.</p>

	  <p>Every minute three new event kinds are invented by Pablo.</p>

	  <p>How could you discover those new apps?
	    How could you control which apps to use?
	    For which event kind?
	    On which device?</p>

	  <p>Nostr App Manager is here to help:
	  </p>

	  <ul>
	    <li>Paste a nostr identifier - pubkey, event id, note, npub, nevent, nprofile, naddr, any kind of nostr: link or a url from any Nostr web client.</li>
	    <li>Get a list of apps that can be used to view this Nostr event.</li>
	    <li>Remember the chosen app to get redirected to it next time.</li>
	    <li>Manage your list of apps, recommend apps to followers, etc (coming soon)</li>
	  </ul>

	  <p>This app is <a href='https://github.com/nostrband/nostr-app-manager'>open source</a>, it has no backend and no trackers. Your app settings are stored in your browser, and your app list is only published if you choose to do so.</p>

	  <p>If you're a client dev, consider redirecting users to this app for event kinds that your client does not support, and for "sharing". For microapps to work, we need a smooth way for users to switch between apps. Nostr App Manager is an attempt to lubricate the microapp experience.</p>
	</Col>
      </Row>
      <Row>
        <Col><Footer /></Col>
      </Row>
    </Container>
  )
}

export default About;
