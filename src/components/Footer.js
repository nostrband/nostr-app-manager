import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <Container>
      <footer className="mt-5 mb-2 ">
        <a href="https://github.com/nostrband/nostr-app-manager">Open-source</a>{' '}
        app by <a href="https://nostr.band">nostr.band</a>
      </footer>
    </Container>
  );
};

export default Footer;
