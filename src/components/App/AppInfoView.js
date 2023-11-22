import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

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
import ReviewsAppInfoView from './Reviews/ReviewsAppInfoView';
import ReacitonsAppInfoView from './ReactionsAppInfoView';
import KindElement from '../../elements/KindElement';
import RepositoryElement from '../../elements/RepositoryElement';
import Releases from '../Releases';

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
  {
    title: 'Releases',
    path: 'releases',
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
  const navigate = useNavigate();
  const [assignedCategory, setAssignedCategory] = useState('');
  const [repositoryLink, setRepositoryLink] = useState({
    type: '',
    link: '',
  });

  const fetchRepositoryEventByRepoLink = async (repoLink) => {
    const ndk = await cmn.getNDK();
    const filter = {
      kinds: [30117],
      '#r': [repoLink],
      authors: [
        'a3396742d16e209dbef6de785024818e7fb5b7f68d9a6c3ee7f21a7725a13f55',
      ],
    };
    const resultFetchAllEvents = await cmn.fetchAllEvents([
      cmn.startFetch(ndk, filter),
    ]);

    if (resultFetchAllEvents[0]) {
      setRepositoryLink({
        type: 'REPOSITORY',
        link: resultFetchAllEvents[0],
      });
    } else {
      setRepositoryLink({
        type: 'GITHUB',
        link: repoLink,
      });
    }
  };

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
    cmn.onAuthed(async () => {
      setRecomms(await cmn.fetchRecomms(addr));
    });
    // app info doesn't require authed user data
    const info = await cmn.fetchApps(addr.pubkey, addr);

    setInfo(info);
    if (info === null || !Object.values(info.apps).length) return;
    const appInfo = Object.values(info.apps)[0].addrHandler;
    const repositoryLink = appInfo?.tags?.find((tag) => tag[2] === 'source');
    if (repositoryLink[1]) {
      fetchRepositoryEventByRepoLink(repositoryLink[1]);
    }
    const tags = appInfo.tags
      .filter((tag) => tag[0] === 't')
      .map((tag) => tag[1]);

    const pubkey = appInfo.tags.find(
      (tag) => tag[0] === 'p' && tag[3] === 'author'
    );

    let profile;
    if (pubkey) {
      profile = await cmn.getProfile(pubkey[1]);
    }
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
  }, [naddr]);

  // on the start
  useEffect(() => {
    init().catch(console.error);
  }, [init]);

  useEffect(() => {
    const { data } = nip19.decode(naddr);
    const fetchAssignedCategory = async () => {
      const ndk = await cmn.getNDK();
      const query = {
        kinds: [1985],
        authors: [
          '3356de61b39647931ce8b2140b2bab837e0810c0ef515bbe92de0248040b8bdd',
        ],
        '#a': [{ kind: data?.pubkey, d_tag: +data?.identifier }],
        '#L': ['org.nostrapps.ontology'],
      };

      const categoriesByArtur = await cmn.fetchAllEvents(
        [cmn.startFetch(ndk, query)],
        'CATEGORY'
      );

      const authorPubkey =
        '3356de61b39647931ce8b2140b2bab837e0810c0ef515bbe92de0248040b8bdd';
      const assignedCategoryEvent = categoriesByArtur.find(
        (event) =>
          event.pubkey === authorPubkey &&
          event.tags.some((tag) => tag[0] === 'l')
      );

      if (assignedCategoryEvent) {
        const assignedCategoryTag = assignedCategoryEvent.tags.find(
          (tag) => tag[0] === 'l'
        );
        if (assignedCategoryTag) {
          setAssignedCategory(assignedCategoryTag[1]);
        }
      }
    };
    fetchAssignedCategory();
  }, []);

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
    releases: <Releases repoLink={repositoryLink.link} />,
  };

  const repositoryElement = () => {
    return (
      <div>
        {repositoryLink.link ? <h6 className="mt-3">Source code:</h6> : null}
        {repositoryLink.type === 'REPOSITORY' && repositoryLink.link ? (
          <div className="repo-app-info">
            <RepositoryElement
              repo={repositoryLink.link}
              getUrl={cmn.getRepositoryUrl}
            />
          </div>
        ) : (
          <a href={repositoryLink.link} target="blank">
            {repositoryLink.link}
          </a>
        )}
      </div>
    );
  };

  if (!params.activeTab) {
    navigate(`/a/${naddr}/reviews`, { replace: true });
  }

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
                  application
                  profile={info.meta}
                  pubkey={addr.pubkey}
                  small={true}
                />
              </div>
              {author?.pubkey && (
                <div>
                  <h6 className="mt-3">Author:</h6>
                  <Profile
                    application
                    profile={{ profile: author }}
                    pubkey={author.pubkey}
                    small={true}
                  />
                </div>
              )}
            </div>
            {app.kinds.length > 0 ? (
              <>
                <h6 className="mt-3">Event kinds:</h6>
                <div>
                  {app.kinds.map((k) => {
                    return (
                      <button
                        class="btn btn-outline-primary mx-1 mb-1 mt-1"
                        onClick={() => navigate(`/kind/${k}`)}
                        key={k}
                      >
                        {cmn.getKindLabel(k)}
                      </button>
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
                    class="btn btn-outline-primary mx-1 mt-1 mb-1"
                    onClick={() => navigate(`/tag/${t}`)}
                    key={t}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            {assignedCategory ? (
              <>
                <h6 className="mt-3">Assigned category:</h6>
                <div>
                  <button
                    class="btn btn-outline-primary mx-1 mt-1 mb-1"
                    onClick={() =>
                      navigate(`/apps/category/${assignedCategory}`)
                    }
                  >
                    {assignedCategory}
                  </button>
                </div>
              </>
            ) : null}
          </AppInfo>
          {repositoryElement()}
          <div className="d-flex  justify-content-center pt-4 pb-3">
            <ul className="nav nav-pills d-flex justify-content-center">
              {tabs.map((nav) => {
                return (
                  <Link to={`/a/${naddr}/${nav.path}`}>
                    <li
                      className={`pointer nav-link nav-item ${
                        params.activeTab === nav.path ? 'active' : ''
                      }`}
                    >
                      {nav.title}
                    </li>
                  </Link>
                );
              })}
            </ul>
          </div>
          {appInfoViewComponents[params.activeTab]}
          {params.activeTab === 'users' ? (
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
