import { useState, useEffect, useCallback } from 'react';
import * as qs from 'native-querystring';

import { nip19 } from '@nostrband/nostr-tools';

import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';

import NostrEvent from '../../elements/Event';
import AppSelectItem from '../../elements/AppSelectItem';
import Index from '../Index';

import * as cmn from '../../common';
import HeaderForEventPage from './HeaderEvent';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './EventApps.scss';
import LoadingSpinner from '../../elements/LoadingSpinner';
import { useParams } from 'react-router-dom';

const EventApps = ({ byUrl }) => {
  const { id: idUrl } = useParams();
  const [addr, setAddr] = useState({});
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [appSettings, setAppSettings] = useState({});
  const [kindApps, setKindApps] = useState([]);
  const [currentApp, setCurrentApp] = useState(null);
  const [env, setEnv] = useState({});
  const [remember, setRemember] = useState(true);
  const [showFullList, setShowFullList] = useState(false);
  const [users, setUsers] = useState({});
  const [moderators, setModerators] = useState([]);

  const getUrl = (app, ad) => {
    ad = ad || addr;
    if (!ad) return '';

    const findUrlType = (type) => {
      return app.urls.find(
        (u) =>
          (u.platform === env.appPlatform || u.platform === 'web') &&
          u.type === type
      );
    };

    const allUrl = findUrlType('');
    const findUrl = (id) => {
      const { type } = nip19.decode(id);
      const u = findUrlType(type) || allUrl;
      if (u != null) return u.url.replace('<bech32>', id);
      return null;
    };

    const naddrId = {
      identifier: ad.d_tag || '',
      pubkey: ad.pubkey,
      kind: ad.kind,
      relays: ad.relays,
    };
    const neventId = {
      // FIXME add kind!
      id: ad.event_id,
      relays: ad.relays,
      author: ad.pubkey,
    };

    let url = '';
    if (ad.kind === 0) {
      url =
        findUrl(nip19.npubEncode(ad.pubkey)) ||
        findUrl(
          nip19.nprofileEncode({ pubkey: ad.pubkey, relays: ad.relays })
        ) ||
        //        findUrl(nip19.naddrEncode(naddrId)) ||
        findUrl(nip19.neventEncode(neventId)) ||
        findUrl(nip19.noteEncode(ad.event_id));
    } else if (ad.kind === 3 || (ad.kind >= 10000 && ad.kind < 20000)) {
      // specific order - naddr preferred
      url =
        // FIXME naddr?
        findUrl(nip19.neventEncode(neventId)) ||
        findUrl(nip19.noteEncode(ad.event_id));
    } else if (ad.kind >= 30000 && ad.kind < 40000) {
      // specific order - naddr preferred
      url =
        findUrl(nip19.naddrEncode(naddrId)) ||
        findUrl(nip19.neventEncode(neventId)) ||
        findUrl(nip19.noteEncode(ad.event_id));
    } else {
      // specific order - naddr preferred
      url =
        findUrl(nip19.neventEncode(neventId)) ||
        findUrl(nip19.noteEncode(ad.event_id));
    }

    return url;
  };

  const parseAddr = (id) => {
    let addr = {
      kind: undefined,
      pubkey: undefined,
      event_id: undefined,
      d_tag: undefined,
      relays: undefined,
      hex: false,
    };

    try {
      const { type, data } = nip19.decode(id);

      switch (type) {
        case 'npub':
          addr.kind = 0;
          addr.pubkey = data;
          break;
        case 'nprofile':
          addr.kind = 0;
          addr.pubkey = data.pubkey;
          addr.relays = data.relays;
          break;
        case 'note':
          addr.event_id = data;
          break;
        case 'nevent':
          addr.event_id = data.id;
          addr.relays = data.relays;
          addr.pubkey = data.author;
          // FIXME add support for kind to nevent to nostr-tool
          break;
        case 'naddr':
          addr.d_tag = data.identifier || '';
          addr.kind = data.kind;
          addr.pubkey = data.pubkey;
          addr.relays = data.relays;
          break;
        default:
          throw new Error('bad id');
      }
    } catch (e) {
      if (id.length === 64) {
        addr.event_id = id;
        addr.hex = true;
      } else {
        console.log('bad id, go home');
        setError('Failed to parse link ' + id);
        return null;
      }
    }
    return addr;
  };

  const redirect = (app, addr) => {
    // make 'back' button return to ?select=true
    addSelect();

    const url = getUrl(app, addr);
    console.log('Auto redirect url', url);

    // make sure browser adds the addSelect to history
    // before we force it to redirect to target
    setTimeout(() => (window.location.href = url), 50);
  };

  const getUsersForKindApps = async (kindApps, kind) => {
    const ndk = await cmn.getNDK();
    try {
      const addrs = kindApps.map((app) => cmn.naddrToAddr(cmn.getNaddr(app)));
      const filter = {
        kinds: [31989],
        '#a': [...addrs],
        '#d': [`${kind}`],
        limit: 100,
      };
      const appRecomms = await cmn.fetchAllEvents([
        cmn.startFetch(ndk, filter),
      ]);
      const userPubkeys = appRecomms.map((event) => event.pubkey);
      const uniquePubkeys = [...new Set(userPubkeys)];
      const filterForFetchProfiles = {
        kinds: [0],
        authors: [...uniquePubkeys],
      };
      const profiles = await cmn.fetchAllEvents([
        cmn.startFetch(ndk, filterForFetchProfiles),
      ]);

      return kindApps.map((app) => {
        const appNaddr = cmn.naddrToAddr(cmn.getNaddr(app));
        const userPubkeys = appRecomms
          .filter((recomm) =>
            recomm.tags.some((tag) => tag[0] === 'a' && tag[1] === appNaddr)
          )
          .map((recomm) => recomm.pubkey);

        const uniquePubkeys = [...new Set(userPubkeys)];
        const userProfiles = profiles.filter((profile) =>
          uniquePubkeys.includes(profile.pubkey)
        );
        return {
          ...app,
          users: userProfiles.map((profile) => {
            try {
              profile.profile = JSON.parse(profile.content)
            } catch {}
            return profile
          }),
        };
      });
    } catch (error) {
      return console.log('ERROR GET USERS FOR KIND APPS', error);
    }
  };

  const init = useCallback(async () => {
    const ndk = await cmn.getNDK();
    const params = !byUrl ? window.location.hash : idUrl;
    if (!params) {
      console.log('No params');
      setAddr(null);
      setEvent(null);
      return;
    }
    let id;
    if (params.length > 0) {
      if (params.includes('#')) {
        id = params.split('#')[1].split('?')[0];
      } else {
        id = params;
      }
    }

    const queryString = !byUrl ? params.split('?')[1] : window.location.search;
    const q = qs.parse(queryString);
    console.log('query', q);

    const select = q.select === 'true';
    console.log('select', select);

    const addr = parseAddr(id);
    if (!addr) return;

    const appPlatform = cmn.getPlatform();
    console.log('appPlatform', appPlatform);

    // load local settings
    const appSettings = cmn.readAppSettings();
    console.log('appSettings', appSettings);

    // do we have an app from settings?
    let savedApp = '';
    if (addr.kind !== undefined) {
      savedApp = cmn.getSavedApp(addr.kind, appPlatform, appSettings);
      console.log('kind', addr.kind, 'app_pubkey', savedApp);
    }

    // check cache for saved app info
    if (savedApp && !select) {
      const app = await cmn.getCachedApp(appPlatform, savedApp);
      console.log('saved app info', app);
      if (app) return redirect(app, addr);
    }

    // if we can't get everything from cache, then we need
    // to start ndk and fetch from network
    async function reload() {
      // if have saved app, try to get app info now
      if (savedApp && !select) {
        const app = await cmn.fetchAppByNaddr(savedApp, appPlatform);
        console.log('saved app remote info', app);
        if (app) return redirect(app, addr);
      }

      // unknown event kind, or saved app not found, or
      // need to show the list of apps,
      // anyways, need to load the event
      const event =
        window.nometaPreloadedEvents?.event || (await cmn.fetchEvent(addr));
      if (!event) {
        // not found
        setError('Failed to find the event ' + id);
        return;
      }

      // update the addr
      addr.kind = event.kind;
      addr.event_id = event.id;
      addr.pubkey = event.pubkey;

      if (event.kind >= 30000 && event.kind < 40000) {
        for (let t of event.tags) {
          if (t.length > 1 && t[0] === 'd') {
            addr.d_tag = t[1];
            break;
          }
        }
      }

      // if kind was unknown, retry getting the saved app
      if (!savedApp)
        savedApp = cmn.getSavedApp(addr.kind, appPlatform, appSettings);

      // ok, kind is known, can we redirect now?
      if (savedApp && !select) {
        const app = await cmn.fetchAppByNaddr(savedApp, appPlatform);
        console.log('saved app remote info', app);
        if (app) return redirect(app, addr);
      }

      // fetch author, need to display the event
      event.meta =
        window.nometaPreloadedEvents?.profile ||
        (await cmn.fetchProfile(event.pubkey)) ||
        {};
      if (event.meta && !event.meta.profile)
        event.meta.profile = cmn.parseContentJson(event.meta.content);

      // set these as soon as possible to render the
      // event on the screen
      setAddr(addr);
      setEvent(event);
      setAppSettings(appSettings);
      setEnv({ appPlatform });

      if (event.kind === 3 || event.kind === 30000 || event.kind === 10000) {
        let pubKeys = event.tags
          .filter((tag) => tag[0] === 'p')
          .map((tag) => tag[1]);

        const firstTenPubkeys = pubKeys.slice(0, 10);
        const filterForGetAuthorsReview = {
          kinds: [0],
          authors: firstTenPubkeys,
        };
        const users = await cmn.fetchAllEvents([
          cmn.startFetch(ndk, filterForGetAuthorsReview),
        ]);

        setUsers({
          countOfOtherUsers: pubKeys.length - firstTenPubkeys.length,
          users,
        });
      }

      if (event.kind === 34550) {
        let pubKeysModerator = event.tags
          .filter((tag) => tag[0] === 'p' && tag[3] === 'moderator')
          .map((tag) => tag[1]);

        const filterForGetModeratorsProfile = {
          kinds: [0],
          authors: pubKeysModerator,
        };

        const moderators = await cmn.fetchAllEvents([
          cmn.startFetch(ndk, filterForGetModeratorsProfile),
        ]);
        setModerators(moderators);
      }

      // get apps for this kind
      const info = await cmn.fetchAppsByKinds([addr.kind]);

      // only our platform please,
      // shuffle the apps to suggest different ones
      const kindApps = cmn
        .filterAppsByPlatform(info, appPlatform)
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

      setKindApps(kindApps);

      // add default apps
      cmn.addDefaultApps(addr.kind, kindApps);

      // find the one we saved
      const updateCurrentApp = (apps) => {
        let currentApp = null;
        if (savedApp)
          currentApp = apps.find(
            (a) => cmn.getNaddr(a) === savedApp
          );
        setCurrentApp(currentApp);
//        setRemember(!currentApp);  
        // always remember by default
        setRemember(true);
      }
      updateCurrentApp(kindApps);

      // fetch users
      const kindAppsWithUsers = await getUsersForKindApps(kindApps, event.kind);
      setKindApps(kindAppsWithUsers);
      updateCurrentApp(kindAppsWithUsers);
    }

    // no personalized data here
    //    cmn.addOnNostr(reload);
    reload();
  }, []);

  // on the start
  useEffect(() => {
    init().catch(console.error);

    const handler = (e) => init().catch(console.error);
    window.addEventListener('popstate', handler);
    window.addEventListener('goHome', handler);

    return () => {
      window.removeEventListener('popstate', handler);
      window.removeEventListener('goHome', handler);
    };
  }, [init]);

  // homepage
  if (addr === null && !byUrl) {
    return <Index addr={addr} />;
  }

  if (!idUrl && byUrl) {
    return <Index addr={addr} />;
  }

  const addSelect = () => {
    const query = 'select=true';
    const url = byUrl
      ? window.location.search
      : window.location.hash.split('?')?.[1] || '';
    if (!url.includes(query)) {
      const suffix = (url.length > 0 ? '&' : '?') + query;
      const result = window.location.href + suffix;
      window.history.replaceState({}, '', result);
    }
  };

  // save the app in local settings for this platform
  const onSelect = async (a, e) => {
    console.log('select', a);

    // first, replace the current url w/ one that has ?select=true
    // and then redirect the user to the app, so that if 'back' is
    // clicked they return to select=true and won't get redirected
    // back again immediately
    addSelect();

    if (!remember) return;

    if (!appSettings.kinds) appSettings.kinds = {};
    if (!appSettings.kinds[event.kind]) appSettings.kinds[event.kind] = {};
    if (!appSettings.kinds[event.kind].platforms)
      appSettings.kinds[event.kind].platforms = {};
    if (!appSettings.kinds[event.kind].platforms[env.appPlatform])
      appSettings.kinds[event.kind].platforms[env.appPlatform] = {};
    appSettings.kinds[event.kind].platforms[env.appPlatform].app =
      cmn.getNaddr(a);

    cmn.writeAppSettings(appSettings);

    // publish the recommendation
    if (cmn.isAuthed()) {
      e.preventDefault();
      const r = await cmn.publishRecomms(a, [event.kind], [env.appPlatform]);
      if (r) console.log(r);

      redirect(a);
    }
  };

  // const login = (e) => {
  //   e.preventDefault();
  //   window.dispatchEvent(new Event('login'));
  // };

  const toggleFullList = () => {
    setShowFullList(!showFullList);
  };

  console.log(kindApps, 'KIND APPS');

  return (
    <>
      <Row>
        <HeaderForEventPage />
      </Row>

      <div className="mt-3 app-container d-flex">
        {(event && (
          <>
            <div style={{ width: '100%' }}>
              <NostrEvent moderators={moderators} users={users} event={event} />
              <center className="mt-2 text-muted">
                <em>
                  <small>
                    This is a preview,
                    <br />
                    choose an app for more info.
                  </small>
                </em>
              </center>
            </div>
          </>
        )) ||
          error || (
            <center style={{ width: '100%' }}>
              <LoadingSpinner />
            </center>
          )}
      </div>
      {event && !showFullList && (
        <div style={{ minHeight: '10vh' }}>&nbsp;</div>
      )}

      {event && !kindApps.length && (
        <center style={{ width: '100%' }}>
          <LoadingSpinner />
        </center>
      )}

      <Row>
        <Col>
          <main className="mt-3">
            <div>
              {event && !showFullList && (
                <div className="app-on-mobile mt-3">
                  <ListGroup>
                    {currentApp ? (
                      <AppSelectItem
                        defaultApp
                        borderRadiusLogo="15px"
                        showMenuButton
                        toggleFullList={toggleFullList}
                        key={currentApp.id}
                        app={currentApp}
                        getUrl={getUrl}
                        onSelect={onSelect}
                        appOnEventAppsPage
                      />
                    ) : (
                      kindApps
                        .filter((a, index) => index === 0)
                        .map((a) => (
                          <AppSelectItem
                            defaultApp
                            showMenuButton
                            borderRadiusLogo="15px"
                            toggleFullList={toggleFullList}
                            key={a.id}
                            app={a}
                            getUrl={getUrl}
                            onSelect={onSelect}
                            appOnEventAppsPage
                          />
                        ))
                    )}
                  </ListGroup>
                </div>
              )}
              {showFullList && (
                <>
                  {currentApp && (
                    <div className="mt-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <h2>Saved apps:</h2>
                      </div>
                      <ListGroup>
                        <AppSelectItem
                          borderRadiusLogo="15px"
                          toggleFullList={toggleFullList}
                          key={currentApp.id}
                          app={currentApp}
                          getUrl={getUrl}
                          onSelect={onSelect}
                          appOnEventAppsPage
                        />
                      </ListGroup>
                    </div>
                  )}
                  <div className="mt-3">
                    <h2>Suggested apps:</h2>
                    <Form>
                      <Form.Check
                        type="switch"
                        id="remember-app"
                        checked={remember ? 'checked' : ''}
                        onChange={(e) => setRemember(e.target.checked)}
                        label={cmn.getRememberLabel(
                          event?.kind,
                          env?.appPlatform
                        )}
                        style={{ display: 'inline-block' }}
                      />
                    </Form>
                    <ListGroup>
                      {kindApps
                        ?.filter((a) => !currentApp || a.id !== currentApp.id)
                        .map((a) => (
                          <AppSelectItem
                            borderRadiusLogo="15px"
                            key={a.id}
                            app={a}
                            getUrl={getUrl}
                            onSelect={onSelect}
                            appOnEventAppsPage
                          />
                        ))}
                    </ListGroup>
                  </div>
                </>
              )}
            </div>
            {/* {showFullList && (
              <>
                <div className="mt-5">
                  <Link to="/about">
                    <Button size="lg" variant="outline-secondary me-2">
                      What is App Manager?
                    </Button>
                  </Link>
                  <Link to="https://www.heynostr.com">
                    <Button size="lg" variant="outline-secondary me-2">
                      What is Nostr?
                    </Button>
                  </Link>
                  <Link to="https://nosta.me">
                    <Button size="lg" variant="outline-primary m2-2">
                      Start using Nostr
                    </Button>
                  </Link>
                </div>
              </>
            )} */}
          </main>
        </Col>
      </Row>
    </>
  );
};

export default EventApps;
