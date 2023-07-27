import Container from 'react-bootstrap/Container';

import './Root.scss';

import AppInfoPage from './pages/AppInfoPage';
import ContainerWithHeaderFooter from './layout/ContainerWithHeaderFooter';
import RepositoryView from './components/RepositoryView';

function RepositoryInfo() {
  return (
    <Container className="Root mt-3">
      <ContainerWithHeaderFooter>
        <RepositoryView />
      </ContainerWithHeaderFooter>
    </Container>
  );
}

export default RepositoryInfo;
