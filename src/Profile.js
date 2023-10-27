import Container from 'react-bootstrap/Container';

import './Root.scss';

import ProfilePage from './pages/ProfilePage';

function Profile() {
  return (
    <Container className="Root mt-3">
      <ProfilePage />
    </Container>
  );
}

export default Profile;
