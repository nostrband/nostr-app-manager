import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { nip19 } from '@nostrband/nostr-tools';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import { Spinner } from 'react-bootstrap';
import Profile from '../../elements/Profile';
import AppInfo from './AppInfo';

import * as cmn from '../../common';
import FollowersAppInfoView from './FollowersAppInfoView';
import ReviewsAppInfoView from './ReviewsAppInfoView';
import ReacitonsAppInfoView from './ReactionsAppInfoView';
import KindElement from '../../elements/KindElement';

const tabs = [
  {
    title: 'Reviews',
    path: 'reviews',
  },
  {
    title: 'Users',
    path: 'users',
  },

  {
    title: 'Reactions',
    path: 'reactions',
  },
];

const AppInfoView = () => {
  const params = useParams();
  const naddr = (params.naddr ?? '').toLowerCase();
  const [error, setError] = useState('');
  const [info, setInfo] = useState(null);
  const [addr, setAddr] = useState(null);
  const [recomms, setRecomms] = useState(null);
  const [showAddApp, setShowAddApp] = useState(false);
  const [addKinds, setAddKinds] = useState([]);
  const [tags, setTags] = useState([]);
  const [addPlatforms, setAddPlatforms] = useState([]);
  const [sending, setSending] = useState(false);
  const [countUsers, setCountUsers] = useState(0);
  const [author, setAuthor] = useState({});
  const [activeComponent, setActiveComponent] = useState('reviews');
  const navigate = useNavigate();

  const init = useCallback(async () => {
    const ndk = await cmn.getNDK();
    const { type, data } = nip19.decode(naddr);
    if (type !== 'naddr') {
      setAddr(null);
      setInfo(null);
      setRecomms(null);
      return;
    }
    const addr = data;
    setAddr(addr);

    // app info doesn't require authed user data
    const info = await cmn.fetchApps(addr.pubkey, addr);
    setInfo(info);
    if (info === null || !Object.values(info.apps).length) return;
    const appInfo = Object.values(info.apps)[0].addrHandler;
    const tags = appInfo.tags
      .filter((tag) => tag[0] === 't')
      .map((tag) => tag[1]);
    const pubkey = appInfo.tags.find(
      (tag) => tag[0] === 'p' && tag[3] === 'author'
    );
    const profile = await cmn.getProfile(pubkey[1]);
    setAuthor(profile);
    setTags(tags);
    setAddKinds(appInfo.kinds);
    setAddPlatforms(appInfo.platforms);
    const addrForGetCountUser = cmn.naddrToAddr(cmn.getNaddr(appInfo));
    const { count } = await ndk.fetchCount({
      kinds: [31989],
      '#a': [addrForGetCountUser],
    });
    setCountUsers(count);
    cmn.onAuthed(async () => {
      setRecomms(await cmn.fetchRecomms(addr));
    });
  }, [naddr]);

  // on the start
  useEffect(() => {
    init().catch(console.error);
  }, [init]);

  if (!naddr || !info || !Object.values(info.apps).length) return null;

  const app = Object.values(info.apps)[0];
  const appInfo = app.addrHandler;
  const toggleAddKind = (kind, checked) => {
    setAddKinds((kinds) =>
      checked ? [...kinds, kind] : kinds.filter((k) => k !== kind)
    );
  };

  const toggleAddPlatform = (platform, checked) => {
    setAddPlatforms((platforms) =>
      checked
        ? [...platforms, platform]
        : platforms.filter((p) => p !== platform)
    );
  };

  async function addApp() {
    setSending(true);
    const r = await cmn.publishRecomms(appInfo, addKinds, addPlatforms);
    setSending(false);
    if (r !== '') {
      setError(r);
      return;
    }

    // hide the modal
    setShowAddApp(false);

    // update
    cmn.fetchRecomms(cmn.getEventAddr(appInfo)).then(setRecomms);
  }
  const appInfoViewComponents = {
    users: <FollowersAppInfoView app={appInfo} recomms={recomms} />,
    reviews: <ReviewsAppInfoView app={appInfo} />,
    reactions: <ReacitonsAppInfoView app={appInfo} />,
  };
  return (
    <>
      {info === null && (
        <div className="d-flex justify-content-center">
          <Spinner className="text-primary" />
        </div>
      )}
      {info && (
        <div className="mt-5 app-info-view">
          <AppInfo key={appInfo.name} app={appInfo}>
            <div>
              <div>
                <h6 className="mt-4">Published by:</h6>
                <Profile
                  profile={info.meta}
                  pubkey={addr.pubkey}
                  small={true}
                />
              </div>
              {author?.pubkey && (
                <div>
                  <h6 className="mt-3">Author:</h6>
                  <Profile
                    profile={{ profile: author }}
                    pubkey={author.pubkey}
                    small={true}
                  />
                </div>
              )}
            </div>

            {app.kinds ? (
              <>
                <h6 className="mt-3">Event kinds:</h6>
                <div>
                  {app.kinds.map((k) => {
                    return (
                      <KindElement key={k} className="me-1">
                        {cmn.getKindLabel(k)}
                      </KindElement>
                    );
                  })}
                </div>
              </>
            ) : null}

            {app.platforms.length > 0 ? (
              <>
                <h6 className="mt-3">Platforms:</h6>
                {app.platforms.map((p) => {
                  return (
                    <KindElement key={p} className="me-1">
                      {p}
                    </KindElement>
                  );
                })}
              </>
            ) : null}
            {tags.length > 0 ? <h6 className="mt-3">Tags:</h6> : null}
            <div>
              {tags.map((t) => {
                return (
                  <button
                    class="btn btn-outline-primary mx-1"
                    onClick={() => navigate(`/tags/${t}`)}
                    key={t}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </AppInfo>
          <div className="d-flex  justify-content-center pt-4 pb-3">
            <ul className="nav nav-pills d-flex justify-content-center">
              {tabs.map((nav) => {
                return (
                  <li
                    onClick={() => {
                      setActiveComponent(nav.path);
                    }}
                    className={`pointer nav-link nav-item ${
                      activeComponent === nav.path ? 'active' : ''
                    }`}
                  >
                    {nav.title}
                  </li>
                );
              })}
            </ul>
          </div>
          {appInfoViewComponents[activeComponent]}
          {activeComponent !== 'reviews' ? (
            <div className="mt-2">
              <Button variant="primary" onClick={(e) => setShowAddApp(true)}>
                Add app to my list
              </Button>
            </div>
          ) : null}
        </div>
      )}
      <Modal show={showAddApp} onHide={(e) => setShowAddApp(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add {appInfo.display_name || appInfo.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-muted">
            Apps in your list are visible to others and allow your followers to
            discover new apps.
          </div>
          <h3 className="mt-3">Event kinds:</h3>
          <div>
            {app.kinds.map((k) => (
              <Form.Check
                type="switch"
                key={k}
                label={cmn.getKindLabel(k)}
                checked={addKinds.includes(k)}
                onChange={(e) => toggleAddKind(k, e.target.checked)}
              />
            ))}
          </div>
          <h3 className="mt-3">Platforms:</h3>
          <div>
            {app.platforms.map((p) => (
              <Form.Check
                type="switch"
                key={p}
                label={p}
                checked={addPlatforms.includes(p)}
                onChange={(e) => toggleAddPlatform(p, e.target.checked)}
              />
            ))}
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={(e) => setShowAddApp(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={sending}
            onClick={(e) => addApp()}
          >
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AppInfoView;
