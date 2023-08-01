import Container from 'react-bootstrap/Container';

import './Root.scss';

import ContainerWithHeaderFooter from './layout/ContainerWithHeaderFooter';
import RepositoryView from './components/RepositoryView';

function RepositoryInfo() {
  return (
    <ContainerWithHeaderFooter>
      <RepositoryView />
    </ContainerWithHeaderFooter>
  );
}

export default RepositoryInfo;
