import Container from 'react-bootstrap/Container';

import './Root.scss';

import { init as initNostrLogin } from "nostr-login"

import RootPage from './pages/RootPage';

initNostrLogin({
  bunkers: "nsec.app,highlighter.com"
});

function Root() {
  return (
    <Container className="Root mt-3">
      <RootPage />
    </Container>
  );
}

export default Root;
