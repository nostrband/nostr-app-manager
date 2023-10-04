import { useState, useEffect, useCallback } from 'react';
import { nip19 } from '@nostrband/nostr-tools';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';
import {
  useSearchParams,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import AppSelectItem from '../elements/AppSelectItem';
import * as cmn from '../common';
import UsedApps from './MainPageComponents/UsedApps';
import NewApps from './MainPageComponents/NewApps';
import FindApps from './MainPageComponents/FindApps';
import Repositories from './MainPageComponents/RepositoriesInMainPage';
import NewReviews from './MainPageComponents/NewReviews';

const navs = [
  {
    title: 'Apps',
    path: 'apps',
  },
  {
    title: 'Code',
    path: 'codes',
  },
  {
    title: 'Find app for event ',
    path: 'search',
  },
  {
    title: 'Reviews',
    path: 'reviews',
  },
];

const Index = () => {
  const { activePage, activeCategory } = useParams();
  const [link, setLink] = useState('');
  const [apps, setApps] = useState([]);
  const [editShow, setEditShow] = useState(false);
  const [editApp, setEditApp] = useState(null);
  const [offForKinds, setOffForKinds] = useState([]);
  const [updated, setUpdated] = useState(0);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleEditClose = () => setEditShow(false);

  const get = (p, s) => {
    const r = new RegExp(p + '[a-z0-9]+');
    const a = r.exec(s);
    if (a === null) return '';

    try {
      const { type, data } = nip19.decode(a[0]);
      if (type + '1' === p) return a[0];
    } catch (e) {
      return '';
    }
  };

  const redirect = (select) => {
    if (!link) return;

    const id =
      get('npub1', link) ||
      get('note1', link) ||
      get('nevent1', link) ||
      get('nprofile1', link) ||
      get('naddr1', link) ||
      (link.length === 64 ? link : '');
    window.location.hash = '#' + id + (select ? '?select=true' : '');
  };

  const open = () => redirect(true);
  const go = () => redirect(false);

  const init = useCallback(async () => {
    const platform = cmn.getPlatform();
    const aps = cmn.readAppSettings();
    const appKinds = {};
    if (aps && aps.kinds) {
      for (const [kind, kas] of Object.entries(aps.kinds)) {
        if (platform in kas.platforms) {
          const naddr = kas.platforms[platform].app;
          if (!naddr.startsWith('naddr1')) continue;

          const a = cmn.naddrToAddr(naddr);
          if (!a) continue;

          if (!(a in appKinds)) appKinds[a] = [Number(kind)];
          else appKinds[a].push(Number(kind));
        }
      }
    }

    async function reload() {
      if (Object.keys(appKinds).length) {
        const info = await cmn.fetchAppsByAs(Object.keys(appKinds));
        const apps = [];
        for (const name in info.apps) {
          const app = info.apps[name].handlers[0];
          const a = cmn.naddrToAddr(cmn.getNaddr(app));
          app.forKinds = appKinds[a];
          apps.push(app);
        }
        setApps(apps);
      }
    }
    // no personalized data here
    // cmn.addOnNostr(reload);
    reload();
  }, []);

  // on the start
  useEffect(() => {
    init().catch(console.error);
  }, [init]);

  const onSelect = (app, e) => {
    e.preventDefault();

    // reset
    setOffForKinds([]);

    // launch modal
    setEditApp(app);
    setEditShow(true);
  };

  const handleOffKind = (e) => {
    const checked = e.target.checked;
    const value = Number(e.target.value);
    if (!checked) {
      // push selected value in list
      setOffForKinds((prev) => [...prev, value]);
    } else {
      // remove unchecked value from the list
      setOffForKinds((prev) => prev.filter((x) => x !== value));
    }
  };

  const handleEditSave = () => {
    setEditShow(false);
    const platform = cmn.getPlatform();
    const aps = cmn.readAppSettings();
    for (const kind of offForKinds) {
      const ps = aps.kinds[kind].platforms;
      delete ps[platform];
    }
    cmn.writeAppSettings(aps);
    setUpdated(updated + 1);
  };
  const setActivePage = (nav) => {
    if (nav === 'apps') {
      navigate(`/main/${nav}/social`);
    } else {
      navigate(`/main/${nav}`);
    }
  };

  const pageComponents = {
    search: <FindApps setLink={setLink} link={link} open={open} go={go} />,
    apps: <NewApps />,
    codes: <Repositories />,
    reviews: <NewReviews />,
  };

  return (
    <main className="mt-1 pt-2">
      {pathname !== '/used-apps' ? (
        <div className="d-flex justify-content-center pt-2 pb-3">
          <ul className="nav nav-pills d-flex justify-content-center ">
            {navs.map((nav) => {
              return (
                <li
                  onClick={() => setActivePage(nav.path)}
                  className={`pointer nav-link nav-item ${
                    activePage === nav.path ? 'active' : ''
                  }`}
                >
                  {nav.title}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      {pathname !== '/about' && pathname !== '/used-apps'
        ? pageComponents[activePage]
        : null}
      {pathname === '/used-apps' ? (
        <UsedApps apps={apps} onSelect={onSelect} />
      ) : null}

      <Modal show={editShow} onHide={handleEditClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit app</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            <AppSelectItem app={editApp} />
          </ListGroup>
          <h4 className="mt-3">Used for:</h4>
          <ListGroup>
            {editApp &&
              editApp.forKinds.map((k) => {
                return (
                  <ListGroup.Item key={k}>
                    <Form.Check
                      type="switch"
                      value={k}
                      checked={offForKinds.includes(k) ? '' : 'checked'}
                      onChange={handleOffKind}
                      label={cmn.getKindLabel(k)}
                    />
                  </ListGroup.Item>
                );
              })}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleEditClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
};

export default Index;
