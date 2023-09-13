import platform from 'platform-detect';
import NDK, {
  NDKFilter,
  NDKEvent,
  NDKNip07Signer,
  NDKRelaySet,
} from '@nostrband/ndk';
import { getPublicKey, nip19 } from '@nostrband/nostr-tools';

import * as cs from './const';

let ndkObject = null;
let authed = false;

// local cache
const profileCache = {};

let onNostrHandlers = [];
let nostrEnabled = false;

const readRelays = [
  'wss://relay.nostr.band/all',
  'wss://nos.lol',
  'wss://relay.damus.io',
];
const writeRelays = [...readRelays, 'wss://nostr.mutinywallet.com']; // for broadcasting

export async function addOnNostr(handler) {
  if (nostrEnabled) await handler();
  else onNostrHandlers.push(handler);
}

export async function onAuthed(handler) {
  // not the current authed state
  const wasAuthed = isAuthed();
  await handler();

  // after nostr extension is ready, recheck the
  // authed state and reload if needed
  addOnNostr(async () => {
    if (wasAuthed !== isAuthed()) await handler();
  });
}

export function enableNostr() {
  return new Promise(function (ok) {
    // check window.nostr periodically, backoff exponentially,
    // and if we've detected window.nostr give it a bit more time
    // to init
    let period = 100;
    let hasNostr = false;
    async function checkNostr() {
      if (hasNostr) {
        nostrEnabled = true;

        // reconnect
        if (ndkObject) {
          ndkObject.signer = new NDKNip07Signer();
        }

        // execute handlers
        for (const h of onNostrHandlers) await h();

        ok();
      } else {
        if (window.nostr) {
          hasNostr = true;
          // wait until it initializes
          setTimeout(checkNostr, 500);
        } else {
          period *= 2;
          setTimeout(checkNostr, period);
        }
      }
    }

    // start it
    checkNostr();
  });
}

export function localGet(key) {
  try {
    if (localStorage) return localStorage.getItem(key);
    else return sessionStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

export function localSet(key, value) {
  try {
    if (localStorage) localStorage.setItem(key, value);
    else sessionStorage.setItem(key, value);
  } catch (e) {}
}

export function readAppSettings() {
  const json = localGet('appSettings');
  try {
    return json ? JSON.parse(json) : {};
  } catch (e) {
    return {};
  }
}

export function writeAppSettings(apps) {
  localSet('appSettings', JSON.stringify(apps));
}

export function getKindLabel(kind) {
  let label = '';
  switch (Number(kind)) {
    case 0:
      label = 'profile';
      break;
    case 1:
      label = 'note';
      break;
    case 3:
      label = 'contact list';
      break;
    case 4:
      label = 'DM';
      break;
    case 6:
      label = 'repost';
      break;
    case 7:
      label = 'reaction';
      break;
    case 8:
      label = 'badge award';
      break;
    case 1063:
      label = 'file info';
      break;
    case 1984:
      label = 'report';
      break;
    case 9735:
      label = 'zap';
      break;
    case 9802:
      label = 'highlight';
      break;
    case 31337:
      label = 'audio track';
      break;
    case 10000:
      label = 'mute list';
      break;
    case 30000:
      label = 'profile list';
      break;
    case 30001:
      label = 'bookmark list';
      break;
    case 30009:
      label = 'badge definitions';
      break;
    case 30008:
      label = 'profile badges';
      break;
    case 30023:
      label = 'long post';
      break;
    case 31989:
      label = 'used apps';
      break;
    case 31990:
      label = 'app handlers';
      break;
    default:
      label = 'event kind ' + kind;
      break;
  }
  return label;
}

export function getRememberLabel(kind, platform) {
  let label = '';
  switch (kind) {
    case 0:
      label = 'profiles';
      break;
    case 1:
      label = 'notes';
      break;
    case 3:
      label = 'contact lists';
      break;
    case 30023:
      label = 'posts';
      break;
    case 9802:
      label = 'highlights';
      break;
    case 31337:
      label = 'audio tracks';
      break;
    case 10000:
      label = 'mute lists';
      break;
    case 30000:
      label = 'profile lists';
      break;
    case 30001:
      label = 'bookmark lists';
      break;
    case 31989:
      label = 'used apps';
      break;
    case 31990:
      label = 'app handlers';
      break;
    default:
      label = 'events of kind ' + kind;
      break;
  }
  return (
    <>
      Remember for <b>{label}</b> on <b>{platform || 'all devices'}</b>
    </>
  );
}

export function getSavedApp(kind, platform, settings) {
  if (
    'kinds' in settings &&
    kind in settings.kinds &&
    'platforms' in settings.kinds[kind] &&
    platform in settings.kinds[kind].platforms
  ) {
    const app = settings.kinds[kind].platforms[platform].app || '';
    if (app.startsWith('naddr1')) return app;
  }

  return '';
}

export function getCachedApp(platform, app_id) {
  // placeholder
  return null;
}

export function getPlatform() {
  if (platform.android) return 'android';
  else if (platform.ios) return 'ios';
  else if (platform.macos) return 'macos';
  else return 'desktop';
}

async function createConnectNDK(custom_relays) {
  // FIXME the issue is that NDK would return EOSE even if some dumb relay
  // returns EOSE immediately w/o returning anything, while others are trying to stream the
  // data, which takes some time. And so instead of getting a merged result from
  // several relays, you get truncated result from just one of them

  const relays = [...new Set([...readRelays, ...writeRelays])];
  if (custom_relays) relays.push(...custom_relays);
  const nip07signer = nostrEnabled ? new NDKNip07Signer() : null;
  ndkObject = new NDK({ explicitRelayUrls: relays, signer: nip07signer });
  await ndkObject.connect();
}

export async function getNDK(relays) {
  if (ndkObject) {
    // FIXME add relays to the pool
    return ndkObject;
  }

  return new Promise(async function (ok) {
    await createConnectNDK(relays);
    ok(ndkObject);
  });
}

export function isPlatform(t) {
  for (const p of cs.platforms) {
    if (p === t) return true;
  }
  return false;
}

export function isType(type) {
  return cs.types.find((t) => t === type) !== undefined;
}

export function getTypes() {
  return cs.types;
}

export function getPlatforms() {
  return cs.platforms;
}

export function getKinds() {
  return cs.kinds;
}

export function getTags(e, name) {
  return e.tags.filter((t) => t.length > 0 && t[0] === name);
}

export function getTag(e, name) {
  const tags = getTags(e, name);
  if (tags.length === 0) return null;
  return tags[0];
}

export function getTagValue(e, name, index, def) {
  const tag = getTag(e, name);
  if (tag === null || !tag.length || (index && index >= tag.length))
    return def !== undefined ? def : '';
  return tag[1 + (index || 0)];
}

export function getEventTagA(e) {
  let addr = e.kind + ':' + e.pubkey + ':';
  if (e.kind >= 30000 && e.kind < 40000) addr += getTagValue(e, 'd');
  return addr;
}

export function dedupEvents(events) {
  const map = {};
  for (const e of events) {
    let addr = e.id;
    if (
      e.kind === 0 ||
      e.kind === 3 ||
      (e.kind >= 10000 && e.kind < 20000) ||
      (e.kind >= 30000 && e.kind < 40000)
    ) {
      addr = getEventTagA(e);
    }
    if (!(addr in map) || map[addr].created_at < e.created_at) {
      map[addr] = e;
    }
  }
  console.log(map, 'MAPP');
  return Object.values(map);
}

export function parseContentJson(content) {
  try {
    return JSON.parse(content);
  } catch (ex) {
    console.log('Bad json content', ex, content);
  }
  return {};
}

export function getEventAddr(e) {
  return {
    kind: e.kind,
    pubkey: e.pubkey,
    identifier: getTagValue(e, 'd'),
  };
}

export function formatNpubShort(pubkey) {
  const npub = nip19.npubEncode(pubkey);
  return npub.substring(0, 12) + '...' + npub.substring(npub.length - 4);
}

export function formatNpub(pubkey) {
  return nip19.npubEncode(pubkey);
}

export function formatNaddr(addr) {
  return nip19.naddrEncode(addr);
}

export function getNaddr(e) {
  return nip19.naddrEncode(getEventAddr(e));
}

export function naddrToAddr(naddr) {
  const { type, data } = nip19.decode(naddr);
  if (type !== 'naddr') return '';
  return data.kind + ':' + data.pubkey + ':' + data.identifier;
}

export async function fetchAllEvents(reqs) {
  const results = await Promise.allSettled(reqs);
  let events = [];
  for (const r of results) {
    if (r.status === 'fulfilled') {
      if (r.value !== null) {
        if (typeof r.value[Symbol.iterator] === 'function')
          events.push(...r.value);
        else events.push(r.value);
      }
    }
  }
  return dedupEvents(events);
}

function prepareHandlers(events, metaPubkey) {
  const info = {
    meta: null,
    apps: {},
  };

  const metas = {};
  for (const e of events) {
    if (e.kind === cs.KIND_META) {
      metas[e.pubkey] = e;

      e.profile = parseContentJson(e.content);

      if (metaPubkey && metaPubkey === e.pubkey) info.meta = e;
    }
  }

  for (const e of events) {
    if (e.kind !== cs.KIND_HANDLERS) continue;

    // init handler profile
    e.inheritedProfile = !e.content;
    e.meta = e.pubkey in metas ? metas[e.pubkey] : null;
    if (e.inheritedProfile) e.profile = e.meta?.profile || {};
    else e.profile = parseContentJson(e.content);

    const kinds = {};
    for (const t of getTags(e, 'k')) {
      if (t.length < 2) continue;
      const k = Number(t[1]);
      if (k < 0 || k > 10000000) continue;
      kinds[k] = 1;
    }
    e.kinds = Object.keys(kinds);

    const ps = {};
    e.urls = [];
    for (const p of cs.platforms) {
      const urls = getTags(e, p);

      for (const url of urls) {
        if (url.length < 2) continue;

        const type = url.length > 2 ? url[2] : '';
        if (!isType(type)) continue;

        ps[p] = 1;
        e.urls.push({
          platform: p,
          url: url[1],
          type,
        });
      }
    }
    e.platforms = Object.keys(ps);

    // dedup by app name
    e.name = getTagValue(e, 'd');
    if (e.content !== '')
      e.name = e.profile.name || e.profile.display_name || '';

    if (!(e.name in info.apps)) {
      info.apps[e.name] = {
        name: e.name,
        handlers: [],
        kinds: [],
        platforms: [],
      };
    }

    const app = info.apps[e.name];
    app.handlers.push(e);
    app.kinds.push(...e.kinds);
    app.platforms.push(...e.platforms);
  }

  return info;
}

export function startFetch(ndk, filter) {
  const relaySet = NDKRelaySet.fromRelayUrls(readRelays, ndk);
  // have to reimplement the ndk's fetchEvents method to allow:
  // - relaySet - only read relays to exclude the mutiny relay that returns EOSE on everything which
  // breaks the NDK's internal EOSE handling (sends eose too early assuming this "fast" relay has sent all we need)
  // - turn of NDK's dedup logic bcs it is faulty (doesn't handle 0, 3, 10k)
  return new Promise((resolve) => {
    const events = [];
    const opts = {};
    const relaySetSubscription = ndk.subscribe(
      filter,
      { ...opts, closeOnEose: true },
      relaySet
    );
    relaySetSubscription.on('event', (event) => {
      event.ndk = this;
      events.push(event);
    });
    relaySetSubscription.on('eose', () => {
      resolve(events);
    });
  });

  //  return ndk.fetchEvents(filter, opts);
}

export async function fetchApps(pubkey, addr) {
  const ndk = await getNDK();
  const filter: NDKFilter = {
    authors: [pubkey],
    kinds: [cs.KIND_META],
  };

  const reqs = [startFetch(ndk, filter)];

  const appsFilter: NDKFilter = {
    authors: [pubkey],
    kinds: [cs.KIND_HANDLERS],
  };
  reqs.push(startFetch(ndk, appsFilter));

  console.log('loading profile and apps for', pubkey, isAuthed());

  // wait for both subs
  const events = await fetchAllEvents(reqs);

  // find handlers
  const info = prepareHandlers(events, pubkey);

  // drop unneeded ones
  if (addr) {
    let app_name = null;
    for (const name in info.apps) {
      for (const handler of info.apps[name].handlers) {
        if (getTagValue(handler, 'd') === addr.identifier) {
          app_name = name;
          break;
        }
      }
    }

    if (app_name === null) {
      info.apps = {};
    } else {
      const app = info.apps[app_name];
      info.apps = {};
      info.apps[app_name] = app;
      app.addrHandler = app.handlers.find(
        (h) => addr.identifier === getTagValue(h, 'd')
      );
    }
  }
  return info;
}

export async function fetchAppsByKinds(kinds, created_at, whereWeUse) {
  const ndk = await getNDK();

  const filter = {
    kinds: [cs.KIND_HANDLERS],
    ...(whereWeUse === 'MAIN_PAGE' ? { limit: 10 } : {}),
    ...(created_at ? { until: created_at } : {}),
  };

  if (kinds && kinds.length > 0) filter['#k'] = kinds.map((k) => '' + k);
  let events = await fetchAllEvents([startFetch(ndk, filter)]);

  const pubkeys = {};
  for (const e of events) pubkeys[e.pubkey] = 1;

  if (events.length > 0) {
    const metas = await fetchAllEvents([
      startFetch(ndk, {
        kinds: [cs.KIND_META],
        authors: Object.keys(pubkeys),
      }),
    ]);
    events = [...events, ...metas];
  }

  // parse
  const info = prepareHandlers(events);

  return info;
}

export async function fetchAppByNaddr(naddr, platform) {
  const { type, data } = nip19.decode(naddr);
  if (type !== 'naddr' || data.kind !== cs.KIND_HANDLERS) return null;

  const ndk = await getNDK();

  const events = await fetchAllEvents([
    startFetch(ndk, {
      authors: [data.pubkey],
      kinds: [cs.KIND_HANDLERS],
      '#d': [data.identifier],
    }),
    startFetch(ndk, {
      authors: [data.pubkey],
      kinds: [cs.KIND_META],
    }),
  ]);

  // parse
  const info = prepareHandlers(events);

  // FIXME inject pre-defined set of apps

  const apps = filterAppsByPlatform(info, platform);

  console.log('apps', apps);
  return apps.length > 0 ? apps[0] : null;
}

export function filterAppsByPlatform(info, platform) {
  const apps = [];
  for (const name in info.apps) {
    const a = info.apps[name];
    if (
      !platform ||
      a.platforms.includes(platform) ||
      a.platforms.includes('web')
    ) {
      // for now show just one matching handler from the same app
      apps.push(a.handlers[0]);
    }
  }
  return apps;
}

export async function fetchRecomms(addr, count, friendPubkeys) {
  count = count || 100;

  const ndk = await getNDK();

  const reqs = [];

  const a = addr.kind + ':' + addr.pubkey + ':' + addr.identifier;
  if (friendPubkeys) {
    reqs.push(
      startFetch(ndk, {
        '#a': [a],
        kinds: [cs.KIND_RECOMM],
        authors: friendPubkeys,
        limit: 100,
      })
    );
  }

  reqs.push(
    startFetch(ndk, {
      '#a': [a],
      kinds: [cs.KIND_RECOMM],
      limit: 100,
    })
  ); // {cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY}

  const events = await fetchAllEvents(reqs);

  for (const e of events) {
    e.isFriend = friendPubkeys && friendPubkeys.includes(e.pubkey);
  }

  events.sort((a, b) => {
    if (a.friend === b.friend) return 0;
    if (a.friend) return 1;
    return -1;
  });
  if (events.length > count) events.length = count;

  if (events.length) {
    const authors = {};
    for (const e of events) authors[e.pubkey] = 1;
    console.log('authors', Object.keys(authors).length, events.length);
    const metas = await fetchAllEvents([
      startFetch(ndk, {
        kinds: [cs.KIND_META],
        authors: Object.keys(authors),
      }),
    ]);
    console.log('metas', metas);

    for (const m of metas) {
      m.profile = parseContentJson(m.content);
    }

    for (const e of events) {
      const meta = metas.find((m) => m.pubkey === e.pubkey);
      e.profile = meta?.profile || {};
    }
  }

  return events;
}

export async function fetchUserRecomms(pubkey, kinds) {
  const ndk = await getNDK();

  const filter = {
    kinds: [cs.KIND_RECOMM],
    authors: [pubkey],
  };
  if (kinds) filter['#d'] = kinds.map((k) => '' + k);
  const events = await fetchAllEvents([startFetch(ndk, filter)]);
  return events;
}

export async function fetchUserRecommsApps(pubkey, kinds) {
  const ndk = await getNDK();

  const filter = {
    kinds: [cs.KIND_RECOMM],
    authors: [pubkey],
  };
  if (kinds) filter['#d'] = kinds.map((k) => '' + k);
  const events = await fetchAllEvents([startFetch(ndk, filter)]);

  const addrEvents = {};
  for (const e of events) {
    // init container
    e.apps = {};

    for (const t of e.tags) {
      if (t.length > 1 && t[0] === 'a') {
        const a = t[1];
        if (a in addrEvents) addrEvents[a].push(e);
        else addrEvents[a] = [e];
      }
    }
  }

  const uniqAddrs = Object.keys(addrEvents);
  if (uniqAddrs.length > 0) {
    const info = await fetchAppsByAs(uniqAddrs);
    for (const name in info.apps) {
      for (const app of info.apps[name].handlers) {
        const a = getEventTagA(app);

        // we might get a wrong combination of pubkey+d
        if (!(a in addrEvents)) continue;

        for (const e of addrEvents[a]) {
          e.apps[app.id] = app;
        }
      }
    }
  }
  console.log('recomms', events);

  return events;
}

export async function fetchAppsByAs(aTags) {
  const ndk = await getNDK();

  const d_tags = {};
  const pubkeys = {};
  for (const a of aTags) {
    const t = a.split(':');
    if (Number(t[0]) !== cs.KIND_HANDLERS) return;

    pubkeys[t[1]] = 1;
    if (t[2]) d_tags[t[2]] = 1;
  }

  const appFilter = {
    kinds: [cs.KIND_HANDLERS],
    '#d': Object.keys(d_tags),
    authors: Object.keys(pubkeys),
  };

  const metaFilter = {
    kinds: [cs.KIND_META],
    authors: Object.keys(pubkeys),
  };

  const appEvents = await fetchAllEvents([
    startFetch(ndk, appFilter),
    startFetch(ndk, metaFilter),
  ]);

  // find meta first
  const info = prepareHandlers(appEvents);
  console.log('info', info);
  return info;
}

export async function fetchProfile(pubkey) {
  if (pubkey in profileCache) return profileCache[pubkey];

  const ndk = await getNDK();
  const events = await fetchAllEvents([
    startFetch(ndk, {
      kinds: [cs.KIND_META],
      authors: [pubkey],
    }),
  ]);
  if (!events.length) return null;

  const p = events[0];
  p.profile = parseContentJson(p.content);
  profileCache[pubkey] = p;
  return p;
}

export async function fetchEvent(addr) {
  const ndk = await getNDK();

  const filter: NDKFilter = {};
  if (addr.event_id) {
    // note, nevent
    filter.ids = [addr.event_id];
  } else if (
    addr.pubkey &&
    addr.d_tag !== undefined &&
    addr.kind !== undefined
  ) {
    // naddr
    filter['#d'] = [addr.d_tag];
    filter.authors = [addr.pubkey];
    filter.kinds = [addr.kind];
  } else if (addr.pubkey && addr.kind !== undefined) {
    // npub, nprofile
    filter.authors = [addr.pubkey];
    filter.kinds = [addr.kind];
  }
  // console.log("loading event by filter", filter);

  const reqs = [startFetch(ndk, filter)];
  if (addr.hex) {
    const profileFilter: NDKFilter = {
      kinds: [0],
      authors: [addr.event_id],
    };
    // console.log("loading profile by filter", profile_filter);
    reqs.push(startFetch(ndk, profileFilter));
  }

  const events = await fetchAllEvents(reqs);
  return events.length > 0 ? events[0] : null;
}

export function addDefaultApps(kind, apps) {
  if (kind === 0) {
    apps.push({
      id: '0000000000000000000000000000000000000000000000000000000000000000',
      kind: cs.KIND_HANDLERS,
      pubkey:
        '0000000000000000000000000000000000000000000000000000000000000000',
      tags: [],
      kinds: [0],
      urls: [
        { url: 'nostr:<bech32>', platform: 'web', type: 'npub' },
        { url: 'nostr:<bech32>', platform: 'web', type: 'nprofile' },
      ],
      profile: {
        name: 'Other app',
        about: 'Redirect to a native app that supports nostr: links',
      },
    });
  } else {
    apps.push({
      id: '0000000000000000000000000000000000000000000000000000000000000001',
      kind: cs.KIND_HANDLERS,
      pubkey:
        '0000000000000000000000000000000000000000000000000000000000000000',
      tags: [],
      kinds: [kind],
      urls: [
        { url: 'nostr:<bech32>', platform: 'web', type: 'note' },
        { url: 'nostr:<bech32>', platform: 'web', type: 'nevent' },
        { url: 'nostr:<bech32>', platform: 'web', type: 'naddr' },
      ],
      profile: {
        name: 'Other app',
        about: 'Redirect to a native app that supports nostr: links',
      },
    });
  }
}

export function getLoginPubkey() {
  return localGet('loginPubkey');
}

export function setLoginPubkey(pubkey) {
  authed = !!pubkey;
  return localSet('loginPubkey', pubkey);
}

export function isAuthed() {
  return authed;
}

export async function publishEvent(event) {
  if (!isAuthed()) {
    return { error: 'Please authorize' };
  }

  const ndk = await getNDK();
  const ndkEvent = new NDKEvent(ndk);

  ndkEvent.kind = event.kind;
  ndkEvent.content = event.content;
  ndkEvent.tags = event.tags;
  ndkEvent.created_at = Math.floor(Date.now() / 1000);
  const relaySet = NDKRelaySet.fromRelayUrls(writeRelays, ndk);
  const r = await ndkEvent.publish(relaySet);
  return true;
}

export function formatAppUrl(naddr) {
  return '/a/' + naddr;
}

export function formatRepositoryEditUrl(naddr) {
  return '/create-repository/' + naddr;
}

export function formatProfileUrl(npub) {
  return '/p/' + npub;
}

export function formatRepositoryUrl(naddr) {
  return /r/ + naddr;
}

export function formatAppEditUrl(naddr) {
  return '/edit/' + naddr;
}

// start the window.nostr check
enableNostr();
addOnNostr(async () => {
  const pubkey = getLoginPubkey();
  authed = pubkey && (await window.nostr.getPublicKey()) === pubkey;
});

export async function publishRecomms(app, kinds, platforms, selectedKinds) {
  if (!isAuthed()) {
    return 'Please login';
  }

  const lists = await fetchUserRecomms(getLoginPubkey());
  const events = [];
  // add new kinds
  for (const k of kinds) {
    const event = {
      kind: cs.KIND_RECOMM,
      content: '',
    };
    const list = lists.find((l) => getTagValue(l, 'd', 0, '') === '' + k);
    if (list) {
      event.tags = list.tags;
    } else {
      event.tags = [['d', '' + k]];
    }

    const a = getEventTagA(app);
    let changed = false;

    // add platforms
    for (const p of platforms) {
      if (!app.platforms.includes(p)) {
        continue;
      }

      if (
        event.tags.find(
          (t) => t.length >= 4 && t[0] === 'a' && t[1] === a && t[3] === p
        ) === undefined
      ) {
        event.tags.push(['a', a, 'wss://relay.nostr.band', p]);
        changed = true;
      }
    }

    // remove platforms
    event.tags = event?.tags?.filter((t) => {
      if (
        t.length >= 4 &&
        t[0] === 'a' &&
        t[1] === a &&
        !platforms.includes(t[3])
      ) {
        changed = true;
        return false;
      } else {
        return true;
      }
    });

    if (changed) {
      events.push(event);
    } else {
      console.log('already on the list', k);
    }
  }

  // check removed kinds
  const removedKinds = selectedKinds?.filter((k) => !kinds.includes(k));
  if (removedKinds) {
    for (const k of removedKinds) {
      const list = lists.find((l) => getTagValue(l, 'd', 0, '') === '' + k);
      if (list) {
        const a = getEventTagA(app);
        let changed = false;
        for (let i = list.tags.length - 1; i >= 0; i--) {
          const tag = list.tags[i];
          if (tag.length >= 4 && tag[0] === 'a' && tag[1] === a) {
            list.tags.splice(i, 1);
            changed = true;
          }
        }
        if (changed) {
          events.push(list);
        } else {
          console.log('not found on the list', k);
        }
      } else {
        console.log('not found in user recomms', k);
      }
    }
  }

  if (events.length === 0) {
    return '';
  }

  let r = null;
  for (const e of events) {
    r = await publishEvent(e);
    if (!r || r.error) break;
  }

  return !r || r.error ? r?.error || 'Failed' : '';
}

export const fetchRepositoryByUser = async (naddr) => {
  const addr = naddrToAddr(naddr.toLowerCase());
  const parts = addr.split(':');
  const kind = parts[0];
  const pubkey = parts[1];
  const identifier = parts[2];
  const ndk = await getNDK();

  const addrForFilter = {
    kinds: [+kind],
    authors: [pubkey],
    '#d': [identifier],
  };

  const resultFetchAllEvents = await fetchAllEvents([
    startFetch(ndk, addrForFilter),
  ]);

  return { resultFetchAllEvents, pubkey, identifier };
};

export function generateAddr(event) {
  const kind = event.kind;
  const pubkey = event.pubkey;
  const identifierTag = event.tags.find((tag) => tag[0] === 'd');
  if (!identifierTag) {
    return null;
  }
  const identifier = identifierTag[1];
  if (!kind || !pubkey || !identifier) {
    console.error('Invalid or missing data for event:', event);
    return null;
  }
  return `${kind}:${pubkey}:${identifier}`;
}

export const getCountReview = (review) => {
  if (review) {
    const filteredTags = review?.tags?.filter((tagArray) =>
      tagArray.includes('l')
    );
    const jsonString = filteredTags[0]?.find(
      (item) =>
        typeof item === 'string' && item.startsWith('{') && item.endsWith('}')
    );
    const jsonObj = JSON.parse(jsonString);
    const quality = jsonObj.quality;
    const originalReview = Math.round(quality * 5);
    return originalReview;
  }
};

export const convertContentToProfile = (event) => {
  let profile = event[0].content ? JSON.parse(event[0].content) : {};
  return { ...profile, pubkey: event[0].pubkey };
};

export const getProfile = async (pubkey) => {
  const ndk = await getNDK();
  const filter = {
    kinds: [0],
    authors: [pubkey],
  };
  try {
    const authorFromServer = await fetchAllEvents([startFetch(ndk, filter)]);
    const profile = convertContentToProfile(authorFromServer);
    return profile;
  } catch (error) {
    return console.log(error);
  }
};

export const generateNoteLink = (id) => {
  let note = nip19.noteEncode(id);
  let link = '/#' + note;
  return link;
};

export const getRepositoryUrl = (event) => {
  const viewUrl = '/r/' + getNaddr(event);
  return viewUrl;
};

export const fetchLikes = async (allReviewIds, pubkey) => {
  const ndk = await getNDK();
  if (isAuthed()) {
    const filter = {
      kinds: [7],
      '#e': [...allReviewIds],
      authors: [pubkey],
    };
    try {
      const result = await fetchAllEvents([startFetch(ndk, filter)]);
      return result;
    } catch (error) {
      console.error('Error fetching liked status:', error);
    }
  }
};

export const fetchAllLikes = async (allReviewIds) => {
  const ndk = await getNDK();
  if (isAuthed()) {
    const filter = {
      kinds: [7],
      '#e': [...allReviewIds],
    };
    try {
      const result = await fetchAllEvents([startFetch(ndk, filter)]);
      return result;
    } catch (error) {
      console.error('Error fetching liked status:', error);
    }
  }
};

export const associateLikesWithReviews = async (reviews) => {
  const allReviewIds = reviews.map((r) => r.id);
  let reviewsWithAllLikes = reviews;

  if (getLoginPubkey()) {
    const resultLikes = await fetchLikes(allReviewIds, getLoginPubkey());
    const reviewsWithLikes = reviews.map((review) => {
      const likeObject = resultLikes?.find((like) =>
        like.tags.some((tag) => tag[0] === 'e' && tag[1] === review.id)
      );
      return { ...review, like: likeObject || false };
    });

    const allLikes = await fetchAllLikes(allReviewIds);
    reviewsWithAllLikes = reviewsWithLikes.map((review) => {
      let likesForThisReview = allLikes.filter((like) =>
        like.tags.some((tag) => tag[0] === 'e' && tag[1] === review.id)
      );
      likesForThisReview = likesForThisReview.filter((like, index, self) => {
        return (
          index ===
          self.findIndex((t) =>
            t.tags.find(
              (tag) =>
                tag[0] === 'e' &&
                tag[1] === like.tags.find((tag) => tag[0] === 'e')[1]
            )
          )
        );
      });
      return { ...review, countLikes: likesForThisReview.length };
    });
  }

  return reviewsWithAllLikes;
};
