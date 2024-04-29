import { useState, useEffect } from 'react';
import Logo from '../icons/Logo';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link, useLocation } from 'react-router-dom';
import './Header.scss';
import * as cmn from '../common';
import { useAuthShowModal } from '../context/ShowModalContext';
import { useAuth } from '../context/AuthContext';
import SearchApp from './SearchApp';
import { isTablet } from '../const';
import { Avatar } from '@mui/material';
import { useAppState } from '../context/AppContext';

function onEarlyAuth(event) {
  // resend to make sure header has rendered and added it's own listener
  setTimeout(() => document.dispatchEvent(new CustomEvent('nlAuth', { detail: event.detail })), 300);
}
document.addEventListener('nlAuth', onEarlyAuth);

const Header = () => {
  const { pathname } = useLocation();
  const { pubkey, setPubkey } = useAuth();
  const [profile, setProfile] = useState(null);
  const { showLogin, setShowLogin } = useAuthShowModal();
  const [error, setError] = useState('');
  const { clearApps } = useAppState();

  async function login() {
    setError('');
    if (!window.nostr) {
      setError('Please install extension');
      return;
    }
    const pubkey = await window.nostr.getPublicKey();
    if (pubkey) {
      setPubkey(pubkey);
      setShowLogin(false);
      cmn.setLoginPubkey(pubkey);
      cmn.fetchProfile(pubkey).then((p) => setProfile(p?.profile));
    } else {
      setError('Failed to login');
    }
  }

  async function logout() {
    cmn.setLoginPubkey('');
    setPubkey('');
    setProfile(null);
  }

  useEffect(() => {
    // on mount, add handler that will be executed
    // when extension is ready (or maybe immediately),
    // and makes sure there are no parallel calls to nostr
    cmn.addOnNostr(async () => {
      if (!cmn.isAuthed()) {
        setPubkey('');
        setProfile(null);
        return;
      }

      const pubkey = await cmn.getLoginPubkey();
      setPubkey(pubkey);

      if (!pubkey) {
        setProfile(null);
        return;
      }

      // async to let other components proceed
      cmn.fetchProfile(pubkey).then((p) => setProfile(p?.profile));
    });

    // update on user login/logout
    document.removeEventListener('nlAuth', onEarlyAuth);
    document.addEventListener('nlAuth', (event) => {
      if (event.detail?.type === 'logout') logout();
      else login();
    });

    // let other components activate the modal
    window.addEventListener('login', () => {
      //    setShowLogin(true);
      login();
    });
  }, []);

  const appsUrl = cmn.formatProfileUrl(cmn.formatNpub(pubkey));

  const goHome = () => {
    // Link click changes the location.hash but doesn't cause the
    // EventApps to rerender, this way we manually force it,
    // _after_ Link has changed the url
    setTimeout(() => {
      window.dispatchEvent(new Event('goHome'));
    }, 0);
  };

  const handleLogout = () => {
    logout();
    document.dispatchEvent(new Event('nlLogout'));
  };

  return (
    <header className="pt-2">
      <Row>
        <Col className="d-flex align-items-center">
          <h4>
            <Link
              className="logo"
              to={`${pathname !== '/' ? '/' : ''}`}
              onClick={goHome}
            >
              <Logo /> <span className="logo-text">App Manager</span>
            </Link>
          </h4>
        </Col>
        <Col style={{ width: isTablet ? '45%' : '65%' }} xs="auto">
          <div className="d-flex justify-content-end">
            {!isTablet ? <SearchApp /> : null}
            {!pubkey && (
              <div>
                <Dropdown drop="down-left">
                  <Dropdown.Toggle
                    style={{ height: '40px' }}
                    variant="outline-secondary"
                  >
                    Menu
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={(e) => login() /*setShowLogin(true)*/ }>
                      Log in
                    </Dropdown.Item>
                    <Dropdown.Divider></Dropdown.Divider>
                    <Dropdown.Item
                      to="/apps/category/all"
                      as={Link}
                      onClick={clearApps}
                    >
                      Apps
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/repos">
                      Repositories
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/reviews">
                      Reviews
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/used-apps">
                      Used apps
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/about">
                      What is it?
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            )}
            {pubkey && (
              <div>
                <Dropdown drop="down-left">
                  <Dropdown.Toggle
                    style={{ height: '40px' }}
                    variant="outline-secondary"
                  >
                    Menu
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item
                      as={Link}
                      to={appsUrl}
                      className="d-flex align-items-center"
                    >
                      <Avatar src={profile?.picture} />
                      <span className="mx-2">
                        {profile
                          ? profile.name ||
                            profile.display_name ||
                            cmn.formatNpubShort(pubkey)
                          : cmn.formatNpubShort(pubkey)}
                      </span>
                    </Dropdown.Item>

                    <Dropdown.Item to="/edit/" as={Link}>
                      Create app
                    </Dropdown.Item>
                    <Dropdown.Item to="/create-repository/" as={Link}>
                      Create repository
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleLogout}>Log out</Dropdown.Item>
                    <Dropdown.Divider></Dropdown.Divider>
                    <Dropdown.Item
                      to="/apps/category/all"
                      as={Link}
                      onClick={clearApps}
                    >
                      Apps
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/repos">
                      Repositories
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/reviews">
                      Reviews
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/used-apps">
                      Used apps
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/about">
                      What is it?
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            )}
          </div>
        </Col>
      </Row>
      {isTablet ? (
        <Col>
          <div className="fade-in mt-2">
            <SearchApp />
          </div>
        </Col>
      ) : null}

      <Modal show={showLogin} onHide={(e) => setShowLogin(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button variant="outline-primary" onClick={login}>
            Login with extension
          </Button>
          <div className="mt-3">
            Please login using Nostr browser extension. You can try{' '}
            <a href="https://getalby.com/" target="_blank" rel="noreferrer">
              Alby
            </a>
            ,{' '}
            <a
              href="https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp"
              target="_blank"
              rel="noreferrer"
            >
              nos2x
            </a>{' '}
            or{' '}
            <a
              href="https://testflight.apple.com/join/ouPWAQAV"
              target="_blank"
              rel="noreferrer"
            >
              Nostore
            </a>{' '}
            (for Safari).
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
        </Modal.Body>
      </Modal>
    </header>
  );
};

export default Header;
