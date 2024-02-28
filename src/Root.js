import Container from 'react-bootstrap/Container';

import './Root.scss';

import { init as initNostrLogin } from "nostr-login"

import RootPage from './pages/RootPage';

initNostrLogin({
  bunkers: "nsec.app,highlighter.com",
  perms: "sign_event:31990,sign_event:31989,sign_event:5,sign_event:7,sign_event:1,sign_event:9734,sign_event:9735,sign_event:30117,sign_event:9042"
});

function Root() {
  return (
    <Container className="Root mt-3">
      <RootPage />
    </Container>
  );
}

export default Root;
