import Container from 'react-bootstrap/Container';

import './Root.scss';

import RootPage from './pages/RootPage';

function Root() {
  return (
    <Container className="Root mt-3">
      <RootPage />
    </Container>
  );
}

export default Root;
