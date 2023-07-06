import Container from 'react-bootstrap/Container';

import './Root.scss';

import AppEditPage from './pages/AppEditPage';

function AppEdit() {
  return (
    <Container className="Root mt-3">
      <AppEditPage />
    </Container>
  );
}

export default AppEdit;
