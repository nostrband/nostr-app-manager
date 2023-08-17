import { useState, useEffect, useCallback } from 'react';
import { nip19 } from '@nostrband/nostr-tools';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';
import { Link, useSearchParams } from 'react-router-dom';
import AppSelectItem from '../elements/AppSelectItem';
import * as cmn from '../common';
import UsedApps from './MainPageComponents/UsedApps';
import NewApps from './MainPageComponents/NewApps';
import FindApps from './MainPageComponents/FindApps';
import Repositories from './MainPageComponents/RepositoriesInMainPage';

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
    title: 'Used Apps',
    path: 'used-apps',
  },
  {
    title: 'Find app for event ',
    path: 'search',
  },
];

const Index = () => {
  const [link, setLink] = useState('');
  const [apps, setApps] = useState([]);
  const [editShow, setEditShow] = useState(false);
  const [editApp, setEditApp] = useState(null);
  const [offForKinds, setOffForKinds] = useState([]);
  const [updated, setUpdated] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams({ page: 'apps' });

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

  const pageComponents = {
    search: <FindApps setLink={setLink} link={link} open={open} go={go} />,
    'used-apps': <UsedApps apps={apps} onSelect={onSelect} />,
    apps: <NewApps />,
    codes: <Repositories />,
  };

  return (
    <main className="mt-3">
      <div className="d-flex justify-content-center pt-4 pb-5">
        <ul class="nav nav-pills d-flex justify-content-center ">
          {navs.map((nav) => {
            return (
              <li
                onClick={() => {
                  setSearchParams({ page: nav.path }); // Set select=true when a nav is clicked
                }}
                className={` pointer nav-link nav-item${
                  searchParams.get('page') === nav.path ? ' active' : ''
                }`}
              >
                {nav.title}
              </li>
            );
          })}
        </ul>
      </div>

      {pageComponents[searchParams.get('page')]}

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
