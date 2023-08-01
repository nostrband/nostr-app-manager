import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { Link } from 'react-router-dom';
import Profile from '../elements/Profile';
import AppSelectItem from '../elements/AppSelectItem';
import * as cmn from '../common';
import Button from 'react-bootstrap/Button';
import EditAppModal from './EditAppModal';
import { ListGroup, Spinner } from 'react-bootstrap';
import PublisedRepositories from './PublisedRepositories';

const init = async (npub, setPubkey, setApps, setRecomms) => {
  const { type, data } = nip19?.decode(npub);
  const pubkey = type === 'npub' ? data : '';
  setPubkey(pubkey);
  if (!pubkey) return;
  const recomms = await cmn.fetchUserRecommsApps(pubkey);
  setRecomms(recomms);
  const apps = await cmn.fetchApps(pubkey);
  setApps(apps);
};

const reorganizeData = (recomms, setReorganizesData) => {
  const groupedApps = {};
  for (const r of recomms) {
    for (const id in r.apps) {
      const app = r.apps[id];
      const app_id = app.profile.name || app.profile.display_name;
      const kind = Number(cmn.getTagValue(r, 'd'));
      if (!(app_id in groupedApps)) {
        groupedApps[app_id] = {
          app_id: app_id,
          kinds: [kind],
          apps: [app],
        };
      } else {
        if (!groupedApps[app_id].kinds.includes(kind)) {
          groupedApps[app_id].kinds.push(kind);
        }
        if (!groupedApps[app_id].apps.some((a) => a.id === app.id)) {
          groupedApps[app_id].apps.push(app);
        }
      }
    }
  }

  const unsortedApps = Object.values(groupedApps);
  const sortedApps = unsortedApps.sort((a, b) =>
    a.app_id.localeCompare(b.app_id, undefined, { sensitivity: 'base' })
  );
  setReorganizesData(sortedApps);
};

const ProfileView = () => {
  const params = useParams();
  const npub = (params.npub ?? '').toLowerCase();
  const [reorganizesData, setReorganizesData] = useState([]);
  const [apps, setApps] = useState(null);
  const [pubkey, setPubkey] = useState('');
  const [recomms, setRecomms] = useState([]);
  const pubKey = cmn.getLoginPubkey();
  const myNpubKey = pubKey ? nip19.npubEncode(pubKey) : '';
  const [selectedApp, setSelectedApp] = useState({
    app: {
      kinds: [],
      platforms: [],
    },
    kinds: [],
  });
  const [showEditModal, setShowEditModal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getRecomnsQuery = useCallback(() => {
    setIsLoading(true);
    init(npub, setPubkey, setApps, setRecomms)
      .then(() => setIsLoading(false))
      .catch(console.error);
  }, [npub]);

  useEffect(() => {
    getRecomnsQuery();
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
      {isLoading ? (
        <div className="d-flex justify-content-center mt-5">
          <Spinner className="text-primary" />
        </div>
      ) : (
        <>
          {apps && (
            <div className="mt-5">
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
              <PublisedRepositories />
              <div className="mt-2">
                <Link to={cmn.formatRepositoryEditUrl('')}>
                  <Button variant="primary">Add repository</Button>
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
                              {app.id === showEditModal ? (
                                <EditAppModal
                                  getRecomnsQuery={getRecomnsQuery}
                                  handleEditClose={handleCloseModal}
                                  openModal={app.id === showEditModal}
                                  selectedApp={selectedApp}
                                  setSelectedApp={setSelectedApp}
                                />
                              ) : null}
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
      )}
    </>
  );
};

export default ProfileView;
