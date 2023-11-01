import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { nip19 } from '@nostrband/nostr-tools';
import Profile from '../elements/Profile';
import * as cmn from '../common';
import { Spinner } from 'react-bootstrap';
import PublishedRepositories from './PublishedRepositories';
import { useAuth } from '../context/AuthContext';
import Apps from './Profile/Apps';
import UsedApps from './Profile/UsedApps';
import NewReviews from './MainPageComponents/NewReviews';
import { useNewReviewState } from '../context/NewReviewsContext';

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

const tabs = [
  {
    title: 'Apps',
    path: 'apps',
  },
  {
    title: 'Repositories',
    path: 'repos',
  },
  {
    title: 'Used apps',
    path: 'used-apps',
  },
  {
    title: 'Reviews',
    path: 'reviews',
  },
];

const ProfileView = () => {
  const params = useParams();
  const npub = (params.npub ?? '').toLowerCase();
  const { type, data } = nip19?.decode(npub);
  const profilePubkey = type === 'npub' ? data : '';
  const [reorganizesData, setReorganizesData] = useState([]);
  const [apps, setApps] = useState(null);
  const [pubkey, setPubkey] = useState('');
  const [recomms, setRecomms] = useState([]);
  const [selectedApp, setSelectedApp] = useState({
    app: {
      kinds: [],
      platforms: [],
    },
    kinds: [],
  });
  const [activeComponent, setActiveComponent] = useState('apps');
  const [isLoading, setIsLoading] = useState(false);
  const { pubkey: isLogged } = useAuth();
  const { newReview } = useNewReviewState();

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

  const profileViewComponents = {
    apps: <Apps apps={apps} isLogged={isLogged} />,
    repos: (
      <PublishedRepositories pubkey={pubkey} isLogged={isLogged} showButton />
    ),
    ['used-apps']: (
      <UsedApps
        selectedApp={selectedApp}
        recomms={recomms}
        reorganizesData={reorganizesData}
        setSelectedApp={setSelectedApp}
        npub={npub}
        getRecomnsQuery={getRecomnsQuery}
      />
    ),
    reviews: (
      <NewReviews
        showSpinner={window.scrollY > 40 || newReview.reviews.length === 0}
        myReviews
        profilePubkey={profilePubkey}
      />
    ),
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
              {profileViewComponents[activeComponent]}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ProfileView;
