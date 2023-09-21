import { useState, useEffect } from 'react';

import Logo from '../icons/Logo';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './Header.scss';

import * as cmn from '../common';
import { useAuthShowModal } from '../context/ShowModalContext';
import { useAuth } from '../context/AuthContext';
import SearchApp from './SearchApp';
import { isTablet } from '../const';
import SearchButton from '../elements/SearchButton';
import { Avatar } from '@mui/material';

const Header = () => {
  const navigate = useNavigate();
  const { pubkey, setPubkey } = useAuth();
  const [profile, setProfile] = useState(null);
  const { showLogin, setShowLogin } = useAuthShowModal();
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSearchField, setShowSearchField] = useState(false);

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
  }, []);

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

  // let other components activate the modal
  window.addEventListener('login', () => {
    setShowLogin(true);
  });

  async function logout() {
    cmn.setLoginPubkey('');
    setPubkey('');
    setProfile(null);
  }

  const appsUrl = cmn.formatProfileUrl(cmn.formatNpub(pubkey));
  const createUrl = cmn.formatAppEditUrl('');
  const createUrlForAddRepo = cmn.formatRepositoryEditUrl('');

  const goHome = () => {
    // Link click changes the location.hash but doesn't cause the
    // EventApps to rerender, this way we manually force it,
    // _after_ Link has changed the url
    setTimeout(() => {
      window.dispatchEvent(new Event('goHome'));
      setSearchParams({ page: 'apps' });
    }, 0);
  };
  return (
    <header className="pt-3">
      <Row>
        <Col className="d-flex align-items-center">
          <h4>
            <Link className="logo" to="/" onClick={goHome}>
              <Logo /> <span className="logo-text">App Manager</span>
            </Link>
          </h4>
        </Col>
        <Col style={{ width: isTablet ? '45%' : '60%' }} xs="auto">
          <div className="d-flex justify-content-end">
            {!isTablet ? (
              <SearchApp />
            ) : (
              <SearchButton
                onClick={() => setShowSearchField((prev) => !prev)}
              />
            )}
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
                    <Dropdown.Item onClick={(e) => setShowLogin(true)}>
                      Log in
                    </Dropdown.Item>
                    <Dropdown.Divider></Dropdown.Divider>
                    <Dropdown.Item
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/used-apps');
                      }}
                    >
                      Used apps
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/about');
                      }}
                    >
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
                    <Dropdown.ItemText>
                      <div className="d-flex align-items-center">
                        <Avatar src={profile?.picture} />
                        <span className="mx-2">
                          {profile
                            ? profile.name ||
                              profile.display_name ||
                              cmn.formatNpubShort(pubkey)
                            : cmn.formatNpubShort(pubkey)}
                        </span>
                      </div>
                    </Dropdown.ItemText>
                    <Dropdown.Item
                      href={appsUrl}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(appsUrl);
                      }}
                    >
                      My apps
                    </Dropdown.Item>
                    <Dropdown.Item
                      href={createUrl}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(createUrl);
                      }}
                    >
                      Create app
                    </Dropdown.Item>{' '}
                    <Dropdown.Item onClick={logout}>Log out</Dropdown.Item>
                    <Dropdown.Divider></Dropdown.Divider>
                    <Dropdown.Item
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(createUrlForAddRepo);
                      }}
                    >
                      Create repository
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/used-apps');
                      }}
                    >
                      Used apps
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/about');
                      }}
                    >
                      What is it?
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            )}
          </div>
        </Col>
      </Row>
      {isTablet && showSearchField ? (
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
