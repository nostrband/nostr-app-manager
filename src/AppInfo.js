import Container from 'react-bootstrap/Container';

import './Root.scss';

import AppInfoPage from "./pages/AppInfoPage";

function AppInfo() {

  return(
    <Container className="Root mt-3">
      <AppInfoPage />
    </Container>
  )
}

export default AppInfo;
