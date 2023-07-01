import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Profile from '../elements/Profile';
import AppSelectItem from '../elements/AppSelectItem';
import * as cmn from '../common';
import { kinds } from '../const';

const ProfileView = () => {
  const params = useParams();
  const npub = (params.npub ?? '').toLowerCase();

  const [apps, setApps] = useState(null);
  const [pubkey, setPubkey] = useState('');
  const [recomms, setRecomms] = useState([]);

  const init = useCallback(async () => {
    const { type, data } = nip19.decode(npub);
    const pubkey = type === 'npub' ? data : '';
    setPubkey(pubkey);
    if (!pubkey) return;

    const apps = await cmn.fetchApps(pubkey);
    setApps(apps);

    const recomms = await cmn.fetchUserRecommsApps(pubkey);
    setRecomms(recomms);
  }, [npub]);

  useEffect(() => {
    init().catch(console.error);
  }, [init]);

  if (!npub) return null;

  // Helper function to reorganize the data
  const reorganizeData = () => {
    const groupedApps = {};

    for (const r of recomms) {
      for (const id in r.apps) {
        const app = r.apps[id];
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
    return Object.values(groupedApps);
  };

  return (
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

          <h4 className="mt-5">Used apps:</h4>
          {!recomms.length && 'Nothing yet.'}
          {recomms.length > 0 && (
            <ListGroup>
              {reorganizeData().map((group) => (
                <div key={group.name} className="mb-4">
                  {group.apps.map((app) => (
                    <AppSelectItem key={app.id} app={app} />
                  ))}
                  <h6 className="mt-3">
                    {group.kinds && group.kinds.length !== 1
                      ? 'Used kinds: '
                      : 'Used kind: '}
                    {group.kinds.map((kind) => (
                      <span key={kind}>
                        {kinds[kind]}
                        <span style={{ color: 'gray', fontWeight: 600 }}>
                          {' '}
                          {`(${kind})`}
                        </span>
                        {kind !== group.kinds[group.kinds.length - 1] && ', '}
                      </span>
                    ))}
                  </h6>
                </div>
              ))}
            </ListGroup>
          )}
        </div>
      )}
    </>
  );
};

export default ProfileView;
