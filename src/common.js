import platform from 'platform-detect'
import NDK, { NDKFilter } from "@nostr-dev-kit/ndk";

const KIND_META = 0;
const KIND_RECOMM = 31989;
const KIND_HANDLERS = 31990;

let ndk = null;

// local cache of app infos
const apps = {
};

// https://www.npmjs.com/package/platform-detect#osmjs + web
export const platforms = {
  android: 1,
  chromeos: 1,
  tizen: 1,
  ios: 1,
  linuxBased: 1,
  windows: 1,
  macos: 1,
  linux: 1,
  web: 1
};

export const defaultApps = [
  {
    id: "3efdaebb1d8923ebd99c9e7ace3b4194ab45512e2be79c1b7d68d9243e0d2681",
    pubkey: "3efdaebb1d8923ebd99c9e7ace3b4194ab45512e2be79c1b7d68d9243e0d2681",
    name: "Damus",
    about: "iOS nostr client",
    picture: "https://damus.io/favicon.ico",
    profile_url: "damus:{npub}",
    event_url: "damus:{note}",
    platforms: ["ios","macos"],
    kinds: [0, 1],
    score: 100,
  },
  {
    id: "amethyst",
    name: "Amethyst",
    about: "Nostr client for Android",
    picture: "https://github.com/vitorpamplona/amethyst/raw/main/fastlane/metadata/android/en-US/images/icon.png",
    platforms: ["android"],
    profile_url: "nostr:{nprofile}",
    event_url: "nostr:{nevent}",
    kinds: [0, 1],
    score: 99,
  },
  {
    id: "84de35e2584d2b144aae823c9ed0b0f3deda09648530b93d1a2a146d1dea9864",
    pubkey: "84de35e2584d2b144aae823c9ed0b0f3deda09648530b93d1a2a146d1dea9864",
    name: "Snort",
    about: "Feature packed nostr web UI",
    profile_url: "https://snort.social/p/{npub}",
    event_url: "https://snort.social/e/{nevent}",
    picture: "https://nostr.band/snort.png",
    platforms: ["web","android"],
    kinds: [0, 1],
    score: 98,
  },
  {
    id: "https://nostr.band/app-recomms/iris.json",
    pubkey: "74dcec31fd3b8cfd960bc5a35ecbeeb8b9cee8eb81f6e8da4c8067553709248d",
    name: "Iris",
    about: "Decentralized messenger",
    profile_url: "https://iris.to/#/profile/{npub}",
    event_url: "https://iris.to/#/post/{note}",
    picture: "https://iris.to/favicon.ico",
    platforms: ["web","android"],
    kinds: [0, 1],
    score: 97,
  },
  {
    id: "532d830dffe09c13e75e8b145c825718fc12b0003f61d61e9077721c7fff93cb",
    pubkey: "532d830dffe09c13e75e8b145c825718fc12b0003f61d61e9077721c7fff93cb",
    name: "Primal",
    about: "Lightning-fast UI for Nostr",
    profile_url: "https://primal.net/profile/{npub}",
    event_url: "https://primal.net/thread/{note}",
    picture: "https://primal.net/assets/favicon-66add1cc.ico",
    platforms: ["web"],
    kinds: [0, 1],
    score: 96,
  },
  {
    id: "2df69cd0c6ab95e08f466abe7b39bb64e744ee31ffc3041f270bdfec2a37ec06",
    pubkey: "2df69cd0c6ab95e08f466abe7b39bb64e744ee31ffc3041f270bdfec2a37ec06",
    name: "Astral",
    profile_url: `https://astral.ninja/{npub}`,
    event_url: `https://astral.ninja/{note}`,
    picture: "https://astral.ninja/favicon.ico",
    platforms: ["web"],
    kinds: [0, 1],
    score: 94,
  },
  {
    id: "coracle",
    name: "Coracle",
    about: "A Nostr client that makes relays a first-class concept",
    profile_url: "https://coracle.social/{nprofile}",
    event_url: "https://coracle.social/{nevent}",
    picture: "https://coracle.social/images/favicon.png",
    platforms: ["web"],
    kinds: [0, 1],
    score: 95,
  },
  {
    id: "nostrgram",
    name: "NostrGram",
    profile_url: "https://nostrgram.co/#profile:allMedia:{pubkey}",
    event_url: "https://nostrgram.co/#thread:{event_id}:{event_id}",
    picture: "https://nostrgram.co/images/logo_new_icon.ico",
    platforms: ["web"],
    kinds: [0, 1],
    score: 90,
  },
  {
    id: "satellite",
    name: "Satellite.Earth",
    about: "Satellite nostr client",
    profile_url: "https://satellite.earth/@{npub}",
    event_url: "https://satellite.earth/thread/{note}",
    picture: "https://satellite.earth/favicon.ico",
    platforms: ["web"],
    kinds: [0, 1],
    score: 93,
  },
  {
    id: "c7063ccd7e9adc0ddd4b77c6bfabffc8399b41e24de3a668a6ab62ede2c8aabd",
    pubkey: "c7063ccd7e9adc0ddd4b77c6bfabffc8399b41e24de3a668a6ab62ede2c8aabd",
    name: "Current.io",
    about: "The power of Bitcoin + nostr at your hands",
    profile_url: "nostr:{npub}",
    event_url: "nostr:{note}",
    picture: "https://app.getcurrent.io/wp-content/uploads/2023/03/cropped-lightning_logo_positiv.-RGB-60x20.png",
    platforms: ["android","ios"],
    kinds: [0, 1],
    score: 93,
  },
  {
    id: "0fe0b18b4dbf0e0aa40fcd47209b2a49b3431fc453b460efcf45ca0bd16bd6ac",
    pubkey: "0fe0b18b4dbf0e0aa40fcd47209b2a49b3431fc453b460efcf45ca0bd16bd6ac",
    name: "Plebstr",
    about: "User-friendly Nostr client",
    profile_url: "nostr:{npub}",
    event_url: "nostr:{note}",
    picture: "https://app.getcurrent.io/wp-content/uploads/2023/03/cropped-lightning_logo_positiv.-RGB-60x20.png",
    platforms: ["android","ios"],
    kinds: [0, 1],
    score: 93,
  },
  {
    id: "nostribe",
    name: "Nostribe",
    profile_url: "https://www.nostribe.com/profile/{npub}",
    event_url: "https://www.nostribe.com/post/{note}",
    picture: "https://www.nostribe.com/_next/static/media/metadata/favicon.d87dc90f.ico",
    platforms: ["web"],
    kinds: [0, 1],
    score: 92,
  },
  {
    id: "nostrid",
    name: "Nostrid",
    profile_url: "https://web.nostrid.app/account/{pubkey}",
    event_url: "https://web.nostrid.app/note/{event_id}",
    picture: "https://web.nostrid.app/icon-192.png",
    platforms: ["web"],
    kinds: [0, 1],
    score: 91,
  },
  {
    id: "yosup",
    name: "Yosup",
    profile_url: "https://yosup.app/profile/{pubkey}",
    event_url: "https://yosup.app/thread/{event_id}",
    picture: "https://yosup.app/icon/logo-inverted.svg",
    platforms: ["web"],
    kinds: [0, 1],
    score: 89,
  },
  // ...
  {
    id: "https://nostr.band/app-recomms/habla.json",
    name: "Habla.News",
    about: "Long-form posts on Nostr",
    profile_url: "https://habla.news/p/{nprofile}",
    naddr_url: "https://habla.news/a/{naddr}",
    picture: "",
    platforms: ["web"],
    kinds: [0, 30023],
    score: 88,
  },
  {
    id: "1743058db7078661b94aaf4286429d97ee5257d14a86d6bfa54cb0482b876fb0",
    pubkey: "1743058db7078661b94aaf4286429d97ee5257d14a86d6bfa54cb0482b876fb0",
    name: "Zapstr.Live",
    about: "Music app on Nostr",
    picture: "https://www.iconarchive.com/download/i50332/ncrow/mega-pack-2/Winamp.ico",
    profile_url: "https://zapstr.live/{npub}/tracks",
    naddr_url: "https://zapstr.live/?track={naddr}",
    platforms: ["web"],
    kinds: [0, 31337],
    score: 87,
  },
  {
    id: "highlighter",
    name: "Highlighter",
    about: "Highlight any content and share on Nostr",
    event_url: "https://highlighter.com/e/{note}",
    picture: "https://highlighter.com/favicon.png",
    platforms: ["web"],
    kinds: [9802],
    score: 86,
  },
/*  {
    id: "818a39b5f164235f86254b12ca586efccc1f95e98b45cb1c91c71dc5d9486dda",
    pubkey: "818a39b5f164235f86254b12ca586efccc1f95e98b45cb1c91c71dc5d9486dda",
    name: "Nostr.Band",
    about: "Search engine for Nostr",
    picture: "https://nostr.band/favicon.ico",
    profile_url: "https://nostr.band/{npub}",
    event_url: "https://nostr.band/{note}",
    platforms: ["web"],
    kinds: [0, 1],
    score: 85,
},
  */
  {
    id: "fc16355b6d5dec84f053c9f35c4d53b8f55d18f25aa901365e5d5c3d1b3b5f38",
    pubkey: "fc16355b6d5dec84f053c9f35c4d53b8f55d18f25aa901365e5d5c3d1b3b5f38",
    name: "Listr.Lol",
    about: "List management app",
    picture: "https://listr.lol/apple-touch-icon.png",
    profile_url: "https://listr.lol/{npub}",
    naddr_url: "https://listr.lol/a/{naddr}",
    platforms: ["web"],
    kinds: [0, 30000, 30001],
    score: 84,
  },
  {
    id: "other_npub",
    name: "Other Native App (npub)",
    about: "Redirect to a native app that supports nostr:npub links.",
    picture: "",
    profile_url: "nostr:{npub}",
    platforms: ["web", "android", "ios", "macos", "desktop"],
    kinds: [0],
    score: -1,
  },
  {
    id: "other_nprofile",
    name: "Other Native App (nprofile)",
    about: "Redirect to a native app that supports nostr:nprofile links.",
    picture: "",
    profile_url: "nostr:{nprofile}",
    platforms: ["web", "android", "ios", "macos", "desktop"],
    kinds: [0],
    score: -2,
  },
  {
    id: "other_note",
    name: "Other Native App (note)",
    about: "Redirect to a native app that supports nostr:note links.",
    picture: "",
    event_url: "nostr:{note}",
    platforms: ["web", "android", "ios", "macos", "desktop"],
    kinds: ["1-9999","40000-"],
    score: -3,
  },
  {
    id: "other_nevent",
    name: "Other Native App (nevent)",
    about: "Redirect to a native app that supports nostr:nevent links.",
    picture: "",
    event_url: "nostr:{nevent}",
    platforms: ["web", "android", "ios", "macos", "desktop"],
    kinds: ["1-9999","40000-"],
    score: -4,
  },
  {
    id: "other_naddr",
    name: "Other Native App",
    about: "Redirect to a native app that supports nostr:naddr links.",
    picture: "",
    naddr_url: "nostr:{naddr}",
    platforms: ["web", "android", "ios", "macos", "desktop"],
    kinds: ["30000-39999"],
    score: -5,
  }
];

export function localGet(key) {
  try
  {
    if (localStorage)
      return localStorage.getItem(key);
    else
      return sessionStorage.getItem(key);
  }
  catch (e)
  {
    return null;
  }
}

export function localSet(key, value) {
  try
  {
    if (localStorage)
      localStorage.setItem(key, value);
    else
      sessionStorage.setItem(key, value);
  }
  catch (e)
  {}
}

export function readAppSettings() {
  const json = localGet("appSettings");
  try {
    return json ? JSON.parse (json) : {};
  } catch (e) {
    return {};
  }
}

export function writeAppSettings(apps) {
  localSet("appSettings", JSON.stringify(apps));
}

export function getKindLabel(kind) {
  let label = "";
  switch (Number(kind)) {
    case 0: label = "profile"; break;
    case 1: label = "note"; break;
    case 30023: label = "post"; break;
    case 9802: label = "highlight"; break;
    case 31337: label = "audio track"; break;
    case 30000: label = "profile list"; break;
    case 30001: label = "bookmark list"; break;
    default: label = "event kind:"+kind; break;
  }
  return label;
}

export function getRememberLabel(kind, platform) {
  let label = "";
  switch (kind) {
    case 0: label = "profiles"; break;
    case 1: label = "notes"; break;
    case 30023: label = "posts"; break;
    case 9802: label = "highlights"; break;
    case 31337: label = "audio tracks"; break;
    case 30000: label = "profile lists"; break;
    case 30001: label = "bookmark lists"; break;
    default: label = "events of kind:"+kind; break;
  }
  return  (
    <>
      Remember for <b>{label}</b> on <b>{platform || "all devices"}</b>
    </>
  )
}

export function getSavedApp(kind, platform, settings) {

  if ("kinds" in settings
      && kind in settings.kinds
      && "platforms" in settings.kinds[kind]
      && platform in settings.kinds[kind].platforms)
    return settings.kinds[kind].platforms[platform].app || "";

  return "";
}

export function getCachedApp(platform, app_id) {
  // placeholder
  return null;
}

export function getPlatform() {
  console.log("platform", platform);
  if (platform.android)
    return "android";
  else if (platform.ios)
    return "ios";
  else if (platform.macos)
    return "macos";
  else
    return "desktop";
}

export async function getAuthor (ndk, event) {
  const author = ndk.getUser({
    hexpubkey: event.pubkey
  });
  await author.fetchProfile();
  console.log("author", author.profile);
  return author.profile;
}

async function getRecomms(ndk, kind) {

  const filter: NDKFilter = {};
  filter.kinds = [KIND_RECOMM];
  if (kind !== undefined)
    filter['#d'] = [`${kind}`] ;
  console.log("loading app recomms by filter", filter);

  const events = await ndk.fetchEvents(filter);
  console.log("app recomms", events);

  const recomms = {};
  // FIXME choose latest per pubkey+d
  for (const e of events) {
    for (const t of e.tags) {
      if (t.length < 2)
	continue;

      if (t[0] === "p") {
	const pubkey = t[1];
	if (pubkey in recomms) {
	  const r = recomms[pubkey];
	  r.authors.push(e.pubkey);
	  if (t.length > 2)
	    r.relays.push(t[2]);
	} else {
	  recomms[pubkey] = {
	    pubkey,
	    authors: [e.pubkey],
	    relays: t.length > 2 ? [t[2]] : [],
	  };
	}
      } else if (t[0] === "r") {
	const url = t[1];
	if (url in recomms) {
	  const r = recomms[url];
	  r.authors.push(e.pubkey);
	} else {
	  recomms[url] = {
	    url,
	    authors: [e.pubkey],
	  };
	}
      }
    }
  }

  return recomms;
}

async function parseInfo(r) {
  try {
    const info = await r.json();
    // FIXME check if valid
    return info;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function getInfos(recomms) {

  const appUrls = [];
  const appFilter: NDKFilter = {};
  appFilter.kinds = [KIND_HANDLERS, KIND_META];
  appFilter.authors = [];
  for (const i in recomms) {
    const r = recomms[i];
    if (r.pubkey)
      appFilter.authors.push(r.pubkey);
    else
      appUrls.push(r.url);
  }

  console.log("loading app meta & handlers by filter", appFilter);
  console.log("loading app info by urls", appUrls);

  let infoPromises = [];
  if (appFilter.authors.length) {
    infoPromises.push(ndk.fetchEvents(appFilter));
  }

  for (const u of appUrls) {
    infoPromises.push(fetch(u));
  }
  console.log("infoPromises", infoPromises.length);

  const results = await Promise.allSettled(infoPromises);
  console.log("results", results);

  let infos = [];
  for (const r of results) {
    if (r.status === "fulfilled") {
      console.log("res", r.value);
      if (r.value.ok) {
	const info = await parseInfo(r.value);
	if (info) {
	  info.id = r.value.url;
	  infos.push(info);
	}
      } else {
	infos.push(...r.value);
      }
    }
  }

  return infos;
}

function parseInfos(infos, recomms) {

  const metas = {};
  const handlers = {};

  const parseHandler = (i, id) => {
    let h_kind = null;
    for (const t of i.tags) {
      if (t.length < 2)
	continue;
      if (t[0] === "d") {
	h_kind = Number(t[1]);
      }
    }
    if (h_kind === null)
      return;

    i.h_kind = h_kind;
    if (!(id in handlers))
      handlers[id] = {};

    const pubkey_handlers = handlers[id];
    if (!(i.h_kind in pubkey_handlers)
	|| (i.created_at && pubkey_handlers[i.h_kind].created_at < i.created_at))
      pubkey_handlers[i.h_kind] = i;
  };

  for (const i of infos) {
    if (i.kind === KIND_META) {
      if (!(i.pubkey in metas) || metas[i.pubkey].created_at < i.created_at) {
	let profile = null;
	try {
	  profile = JSON.parse(i.content);
	} catch (e) {
	  console.log(e);
	  continue;
	}

	metas[i.pubkey] = {
	  id: i.pubkey,
	  name: profile?.display_name || profile?.name,
	  picture: profile?.picture,
	  about: profile?.about,
	};
      }

    } else if (i.kind) {
      parseHandler(i, i.pubkey);
    } else {

      metas[i.id] = {
	id: i.id,
	name: i.meta?.display_name || i.meta?.name,
	picture: i.meta?.picture,
	about: i.meta?.about,
      };

      for (const h of i.handlers) {
	parseHandler(h, i.id);
      }
    }
  }

  for (const id in metas) {
    const app = metas[id];
    app.recomms = recomms[id];
    app.handlers = handlers[id];
  }

  return metas;
}

function prepareApps(apps) {

  // attach recomms & handlers
  let map = {};
  let list = [];
  for (const id in apps) {
    const app = apps[id];
    app.platforms = [];
    app.kinds = [];
    for (const h_kind in app.handlers) {
      const h = app.handlers[h_kind];
      app.kinds.push(h.h_kind);
      for (const t of h.tags) {
	if (t.length < 2)
	  continue;
	if (t[0] in platforms) {
	  const p = t[0];
	  app.platforms.push (p);
	  if (platform === undefined // all
	      || p === platform // requested
	      || p === "web" // always suggested
	  ) {
	    if (t.length === 2 || t[2] === "npub")
	      app.profile_url = t[1].replace("<bech32>", "{npub}");
	    if (t.length === 2 || t[2] === "nprofile")
	      app.profile_url = t[1].replace("<bech32>", "{nprofile}");
	    if (h.h_kind >= 30000 && h.h_kind < 40000) {
	      if (t.length === 2 || t[2] === "naddr")
		app.naddr_url = t[1].replace("<bech32>", "{naddr}");
	    } else {
	      if (t.length === 2 || t[2] === "note")
		app.event_url = t[1].replace("<bech32>", "{note}");
	      if (t.length === 2 || t[2] === "nevent")
		app.event_url = t[1].replace("<bech32>", "{nevent}");
	    }
	  }
	}
      }
    }
    app.score = app.recomms?.authors.length;

    // for now, reuse scores from our default list
    for (const a of defaultApps) {
      if (a.id === app.id && a.score > app.score) {
	app.score = a.score;
      }
    }

    map[app.id] = 1;
    list.push(app);
  }

  // merge w/ default apps list
  for (const a of defaultApps) {
    if (!(a.id in map)) {
      list.push(a);
    }
  }

  // order by score
  list.sort(function (a, b) { return b.score - a.score; });

  return list;
}

function filterApps(list, kind) {
  let kindApps = [];
  if (kind === undefined) {
    kindApps = list;
  } else {
    for (const a of list) {

      // same platform, or web (it's everywhere)
      if (!a.platforms.includes (platform) && !a.platforms.includes ("web"))
	continue;

      // app lists the kind?
      if (a.kinds.includes (kind)) {
	kindApps.push(a);
      } else {

	// kind ranges
	for (const k of a.kinds) {
	  if (typeof k !== "string")
	    continue;

	  const range = k.split("-");
	  if (range.length === 1 && (kind + "") === k) {
	    kindApps.push(a);
	  } else {
	    if ((!range[0].length || Number(range[0]) <= kind)
		&& (!range[1].length || Number(range[1]) >= kind)) {
	      kindApps.push(a);
	    }
	  }
	}
      }
    }
  }

  return kindApps;
}

export async function getKindApps(ndk, platform, kind) {

  const recomms = await getRecomms(ndk, kind);
  console.log("recomms", recomms);

  const infos = await getInfos(recomms);
  console.log("app meta & handlers", infos);

  const apps = parseInfos(infos, recomms);
  console.log("apps", apps);

  const list = prepareApps(apps);
  console.log("list", list);

  return filterApps(list, kind);
}

export async function getApp(ndk, platform, id) {
  // FIXME check cache, and load from the network if needed

  for (const a of defaultApps) {
    if (a.id === id)
      return a;
  }

  if (id.startsWith("http") || id.length !== 64)
    return null;

  const filter: NDKFilter = {};
  filter.kinds = [KIND_HANDLERS];
  filter.authors = [id];
  console.log("loading app by filter", filter);

  const event = await ndk.fetchEvent(filter);
  console.log("app event", event);

  return event;
}

async function createConnectNDK (custom_relays) {
  const relays = ["wss://relay.nostr.band/all", "wss://nos.lol", "wss://relay.damus.io",
		  "wss://nostr.mutinywallet.com" // for broadcasting
  ];
  if (custom_relays)
    relays.push(...custom_relays);
  const n = new NDK({ explicitRelayUrls: relays });
  console.log("ndk connecting...");
  await n.connect();
  return n;
}

export async function getNDK (relays) {
  if (ndk) {
    // FIXME add relays to the pool
    console.log("ndk already connected");
    return ndk;
  }

  return new Promise(async function (ok) {
    ndk = await createConnectNDK(relays);
    ok(ndk);
  });
}
