import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { Link } from 'react-router-dom';
import Profile from '../elements/Profile';
import AppSelectItem from '../elements/AppSelectItem';
import * as cmn from '../common';
import Button from 'react-bootstrap/Button';
import EditAppModal from './EditAppModal';
import { ListGroup } from 'react-bootstrap';

const init = async (npub, setPubkey, setApps, setRecomms) => {
  const { type, data } = nip19.decode(npub);
  const pubkey = type === 'npub' ? data : '';
  setPubkey(pubkey);
  if (!pubkey) return;

  const apps = await cmn.fetchApps(pubkey);
  console.log(apps, 'APPS');
  setApps(apps);
  const recomms = await cmn.fetchUserRecommsApps(pubkey);
  console.log(recomms, 'RECOMNS');
  setRecomms(recomms);
};

const reorganizeData = (recomms, setReorganizesData) => {
  const groupedApps = {};
  for (const r of recomms) {
    for (const id in r.apps) {
      const app = r.apps[id];
      console.log(app, 'APP');
      const name = app.name;
      const kind = Number(cmn.getTagValue(r, 'd'));

      if (!(name in groupedApps)) {
        groupedApps[name] = {
          kinds: [kind],
          apps: [app],
        };
      } else {
        if (!groupedApps[name].kinds.includes(kind)) {
          groupedApps[name].kinds.push(kind);
        }
        // Check for duplicate apps before adding
        if (!groupedApps[name].apps.some((a) => a.id === app.id)) {
          groupedApps[name].apps.push(app);
        }
      }
    }
  }
  setReorganizesData(Object.values(groupedApps));
};

const ProfileView = () => {
  const params = useParams();
  const npub = (params.npub ?? '').toLowerCase();
  const [reorganizesData, setReorganizesData] = useState([]);
  const [apps, setApps] = useState(null);
  const [pubkey, setPubkey] = useState('');
  const [recomms, setRecomms] = useState([]);
  const pubKey = cmn.getLoginPubkey();
  const myNpubKey = nip19.npubEncode(pubKey);
  const [selectedApp, setSelectedApp] = useState({
    app: {},
    kinds: [],
  });
  const [showEditModal, setShowEditModal] = useState(null);
  useEffect(() => {
    init(npub, setPubkey, setApps, setRecomms).catch(console.error);
  }, [npub]);

  useEffect(() => {
    reorganizeData(recomms, setReorganizesData);
  }, [recomms, selectedApp]);

  const handleCloseModal = () => {
    setShowEditModal(null);
  };

  if (!npub) return null;

  return (
    <>
      {apps && (
        <div style={{ border: '2px solid red' }} className="mt-5">
          <Profile profile={apps.meta} pubkey={pubkey} />
          <h4 className="mt-5">Published apps:</h4>
          {!Object.keys(apps.apps).length && 'Nothing yet.'}
          {apps.apps && (
            <ListGroup>
              {Object.keys(apps.apps).map((name) => {
                const app = apps.apps[name];
                const h = app.handlers[0];
                return <AppSelectItem key={h.name} app={h} />;
              })}
            </ListGroup>
          )}
          <div className="mt-2">
            <Link to={cmn.formatAppEditUrl('')}>
              <Button variant="primary">Add app</Button>
            </Link>
          </div>

          <h4 className="mt-5">Used apps:</h4>
          {!recomms.length && 'Nothing yet.'}
          {recomms.length > 0 && (
            <ListGroup>
              {reorganizesData.map((group) => (
                <>
                  <div key={group.name} className="mb-3">
                    {group.apps.map((app) => {
                      return (
                        <>
                          <AppSelectItem
                            showKinds
                            selecteAppForEdit={() => {
                              setSelectedApp({
                                app: { ...app },
                                kinds: group.kinds,
                              });
                              setShowEditModal(app.id);
                            }}
                            myApp={myNpubKey === npub}
                            key={app.id}
                            app={{ ...app, forKinds: group.kinds }}
                          />
                          <EditAppModal
                            handleEditClose={handleCloseModal}
                            openModal={app.id === showEditModal}
                            selectedApp={selectedApp}
                            setSelectedApp={setSelectedApp}
                          />
                        </>
                      );
                    })}
                  </div>
                </>
              ))}
            </ListGroup>
          )}
        </div>
      )}
    </>
  );
};

export default ProfileView;
