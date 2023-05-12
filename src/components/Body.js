import { useState, useEffect, useCallback } from "react";
import * as qs from 'native-querystring';
import platform from 'platform-detect'

import NDK, { NDKFilter } from "@nostr-dev-kit/ndk";
import { nip19 } from 'nostr-tools'

import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import Event from "./Event";
import NostrApp from "./NostrApp";
import Index from "./Index";

const apps = [
  {
    pubkey: "damus",
    name: "Damus",
    picture: "https://damus.io/favicon.ico",
    profile_url: "damus:{npub}",
    event_url: "damus:{note}",
    platforms: ["ios","macos"],
    kinds: [0, 1],
  },
  {
    pubkey: "amethyst",
    name: "Amethyst",
    picture: "https://github.com/vitorpamplona/amethyst/raw/main/fastlane/metadata/android/en-US/images/icon.png",
    platforms: ["android"],
    profile_url: "nostr:{nprofile}",
    event_url: "nostr:{nevent}",
    kinds: [0, 1],
  },
  {
    pubkey: "snort",
    name: "Snort",
    profile_url: "https://snort.social/p/{npub}",
    event_url: "https://snort.social/e/{nevent}",
    picture: "https://nostr.band/snort.png",
    platforms: ["web","android"],
    kinds: [0, 1],
  },
  {
    pubkey: "iris",
    name: "Iris",
    profile_url: "https://iris.to/#/profile/{npub}",
    event_url: "https://iris.to/#/post/{note}",
    picture: "https://iris.to/favicon.ico",
    platforms: ["web","android"],
    kinds: [0, 1],
  },
  {
    pubkey: "primal",
    name: "Primal",
    profile_url: "https://primal.net/profile/{npub}",
    event_url: "https://primal.net/thread/{note}",
    picture: "https://primal.net/assets/favicon-66add1cc.ico",
    platforms: ["web"],
    kinds: [0, 1],
  },
  {
    pubkey: "astral",
    name: "Astral",
    profile_url: `https://astral.ninja/{npub}`,
    event_url: `https://astral.ninja/{note}`,
    picture: "https://astral.ninja/favicon.ico",
    platforms: ["web"],
    kinds: [0, 1],
  },
  {
    pubkey: "coracle",
    name: "Coracle",
    profile_url: "https://coracle.social/{nprofile}",
    event_url: "https://coracle.social/{nevent}",
    picture: "https://coracle.social/images/favicon.png",
    platforms: ["web"],
    kinds: [0, 1],
  },
  {
    pubkey: "nostrgram",
    name: "NostrGram",
    profile_url: "https://nostrgram.co/#profile:allMedia:{pubkey}",
    event_url: "https://nostrgram.co/#thread:{event_id}:{event_id}",
    picture: "https://nostrgram.co/images/logo_new_icon.ico",
    platforms: ["web"],
    kinds: [0, 1],
  },
  {
    pubkey: "satellite",
    name: "Satellite.Earth",
    profile_url: "https://satellite.earth/@{npub}",
    event_url: "https://satellite.earth/thread/{note}",
    picture: "https://satellite.earth/favicon.ico",
    platforms: ["web"],
    kinds: [0, 1],
  },
  // ...
  {
    pubkey: "habla",
    name: "Habla.News",
    about: "Long-form posts on Nostr",
    profile_url: "https://habla.news/u/{nprofile}",
    event_url: "https://habla.news/a/{naddr}",
    picture: "https://habla.news/favicon.ico",
    platforms: ["web"],
    kinds: [0, 30023],
  },
  {
    pubkey: "zapstr",
    name: "Zapstr.Live",
    about: "Music app on Nostr",
    picture: "https://www.iconarchive.com/download/i50332/ncrow/mega-pack-2/Winamp.ico",
    profile_url: "https://zapstr.live/{npub}/tracks",
    event_url: "https://zapstr.live/?track={naddr}",
    platforms: ["web"],
    kinds: [0, 31337],
  },
  {
    pubkey: "highlighter",
    name: "Highlighter",
    about: "Highlight any content and share on Nostr",
    event_url: "https://highlighter.com/e/{note}",
    picture: "https://highlighter.com/favicon.png",
    platforms: ["web"],
    kinds: [9802],
  },
  {
    pubkey: "nostr_band",
    name: "Nostr.Band",
    about: "Search engine for Nostr",
    picture: "https://nostr.band/favicon.ico",
    profile_url: "https://nostr.band/{npub}",
    event_url: "https://nostr.band/{note}",
    platforms: ["web"],
    kinds: [0, 1],
  },
  {
    pubkey: "listr",
    name: "Listr.Lol",
    about: "List management app",
    profile_url: "https://listr.lol/{npub}",
    event_url: "https://listr.lol/a/{naddr}",
    platforms: ["web"],
    kinds: [30000, 30001],
  }
];

function localGet(key) {
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

function localSet(key, value) {
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

function getAppForKind(kind) {
  return localGet("app"+kind);
}

function setAppForKind(kind, app) {
  localSet("app"+kind, app);
}

function getKindLabel(kind) {
  let label = "";
  switch (kind) {
    case 0: label = "profile"; break;
    case 1: label = "note"; break;
    case 30023: label = "post"; break;
    case 9802: label = "highlight"; break;
    case 31337: label = "audio track"; break;
    case 30000: label = "profile list"; break;
    case 30001: label = "bookmark list"; break;
    default: label = "Nostr event"; break;
  }
  return label;
}

function getRememberLabel(kind, platform) {
  let label = "";
  switch (kind) {
    case 0: label = "profiles"; break;
    case 1: label = "notes"; break;
    case 30023: label = "posts"; break;
    case 9802: label = "highlights"; break;
    case 31337: label = "audio tracks"; break;
    case 30000: label = "profile lists"; break;
    case 30001: label = "bookmark lists"; break;
    default: label = "these Nostr events"; break;
  }
  return  (
    <>
      Remember chosen app for <b>{label}</b> on <b>{platform || "all devices"}</b>
    </>
  )
}

const Body = () => {
  const [ndk, setNDK] = useState(null);
  const [addr, setAddr] = useState({});
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [kindApps, setKindApps] = useState([]);
  const [env, setEnv] = useState({});
  const [remember, setRemember] = useState(true);

  const fetch = async (n, addr) => {
    const filter: NDKFilter = {};
    if (addr.event_id) {
      // note, nevent
      filter.ids = [addr.event_id];
    } else if (addr.pubkey && addr.d_tag !== undefined && addr.kind !== undefined) {
      // naddr
      filter['#d'] = [addr.d_tag];
      filter.authors = [addr.pubkey];
      filter.kinds = [addr.kind];
    } else if (addr.pubkey && addr.kind !== undefined) {
      // npub, nprofile
      filter.authors = [addr.pubkey];
      filter.kinds = [addr.kind];
    }
    console.log("loading event by filter", filter);
 
    const reqs = [n.fetchEvent(filter)];
    if (addr.hex) {
      const profile_filter: NDKFilter = {
	kinds: [0],
	authors: [addr.event_id]
      };
      console.log("loading profile by filter", profile_filter);
      reqs.push(n.fetchEvent(profile_filter));
    }

    const e = await Promise.any(reqs);
    console.log("event", e);
    return e;
  }

  const getUrl = (app, e) => {
    if (!e)
      e = event;
    let url = e.kind ? app.event_url : app.profile_url;

    if (event?.kind === 0) {
      const npub = nip19.npubEncode(e.pubkey);
      const nprofile = nip19.nprofileEncode({ pubkey: e.pubkey, relays: addr.relays });
      url = url
	.replaceAll ("{npub}", npub)
	.replaceAll ("{nprofile}", nprofile)
	.replaceAll ("{pubkey}", e.pubkey)
      ;
    } else if (url) {
      const note = nip19.noteEncode(e.id);
      const nevent = nip19.neventEncode({
	// FIXME add kind!
	id: e.id, relays: addr.relays, author: e.pubkey });
      const naddr = nip19.naddrEncode({
	identifier: addr.d_tag,
	pubkey: e.pubkey,
	kind: e.kind,
	relays: addr.relays
      });
      url = url
	.replaceAll ("{note}", note)
	.replaceAll ("{nevent}", nevent)
	.replaceAll ("{naddr}", naddr)
	.replaceAll ("{event_id}", e.id);
    }

    return url;
  };

  const init = useCallback(async () => {
    
    const params = window.location.hash;
    if (!params)
    {
      console.log("No params");
      setAddr(null);
      return;
    }

    const id = params.split('#')[1].split('?')[0];
    console.log("id", id);

    const q = qs.parse(params.split('?')[1]);
    console.log("q", q);

    const select = q.select === 'true';

    let addr = {
      kind: undefined,
      pubkey: undefined,
      event_id: undefined,
      d_tag: undefined,
      relays: undefined,
      hex: false,
    };

    try {
      const {type, data} = nip19.decode(id)

      switch (type) {
	case "npub":
	  addr.kind = 0;
	  addr.pubkey = data;
	  break;
	case "nprofile":
	  addr.kind = 0;
	  addr.pubkey = data.pubkey;
	  addr.relays = data.relays;
	  break;
	case "note":
	  addr.event_id = data;
	  break;
	case "nevent":
	  addr.event_id = data.id;
	  addr.relays = data.relays;
	  addr.pubkey = data.author;
	  // FIXME add support for kind to nevent to nostr-tool 
	  break;
	case "naddr":
	  addr.d_tag = data.identifier || "";
	  addr.kind = data.kind;
	  addr.pubkey = data.pubkey;
	  addr.relays = data.relays;
	  break;
	default: throw "bad id";
      }

    } catch (e) {
      if (id.length === 64) {
	addr.event_id = id;
	addr.hex = true;
      } else {
	console.log("bad id, go home");
	setError("Failed to parse link " + id);
	return;
      }
    }
    
    console.log("addr", addr);
    setAddr(addr);

    let app = null;
    if (addr.kind !== undefined) {
      const pubkey = getAppForKind(addr.kind);
      console.log("kind", addr.kind, "app_pubkey", pubkey);
    }

    if (select || !app || addr.kind === undefined) {
      const relays = ["wss://relay.nostr.band", "wss://nos.lol", "wss://nostr.mutinywallet.com"];
      if (addr.relays)
	relays.push(...addr.relays);
      const n = new NDK({ explicitRelayUrls: relays });
      setNDK(n);
      console.log("ndk connecting...");
      await n.connect();

      const e = await fetch(n, addr);
      if (e) {
	const pubkey = getAppForKind(e.kind);
	console.log("kind", e.kind, "app_pubkey", pubkey, "select", select);
	if (!select) {
	  for (const a of apps) {
	    if (a.pubkey === pubkey) {
	      //	      window.location.href = getUrl(a, e);
	      console.log("Auto url", getUrl(a, e));
	    }
	  }
	}

	// update the addr?
	addr.kind = e.kind;
	addr.event_id = e.id;
	addr.pubkey = e.pubkey;

	// get author?
	const author = n.getUser({
	  hexpubkey: e.pubkey
	});
	await author.fetchProfile();
	console.log("author", author.profile);
	e.author = author.profile;

	// set state w/ author
	setEvent(e);
      } else {
	setError("Failed to find the event " + id);
      }
    }

    let appPlatform = "desktop";
    if (platform.os === "android")
      appPlatform = "android";
    else if (platform.os === "ios")
      appPlatform = "ios";
    else if (platform.os === "macos")
      appPlatform = "macos";
    setEnv ({appPlatform});
    
    let ka = [];
    for (const a of apps) {
      if (!a.kinds.includes (addr.kind))
	continue;

      if (!a.platforms.includes (appPlatform) && !a.platforms.includes ("web"))
	continue;

      ka.push(a);
    }
    setKindApps(ka);
    
    /* Somehow get the kind for this event,
       then determine the app to be used for it,
       then if we've got the app set up - redirect to the one from our settings,
       otherwise render the event and ask to choose the app
     */
  }, []);

  // on the start
  useEffect(() => {
    init().catch(console.error);
    window.addEventListener("popstate",(e) => { init().catch(console.error); });
  }, [init]);

  // homepage
  if (addr === null) {
    return (
      <Index />
    )
  }

  const onSelect = (a) => {
    console.log("select", a);
    if (remember)
      setAppForKind(event.kind, a.pubkey);
  };

  const label = getRememberLabel(event?.kind, env?.appPlatform);
  return (
    <main className="mt-5">
      <div>
	<h2>Choose a Nostr app for this {getKindLabel(event?.kind)}:</h2>
	{(event && (
	  <div>
	    <Event event={event} />
	  </div>
	)) || error || "Loading..."}</div>
      <div className="mt-5">
	<h2>Suggested apps:</h2>
	<Form>
	  <Form.Check
            type="switch"
            id="remember-app"
            checked={remember ? "checked" : ""}
            onChange={e => setRemember(e.target.checked)}
            label={label}
            style={{display: "inline-block"}}
	  />
	  <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="remember-tooltip">Remember the chosen app and automatically redirect to it next time. The app will be saved in your browser. You can edit your app list and publish it on Nostr at the nostrapp.link homepage.</Tooltip>}
	  >
	    {({ ref, ...triggerHandler }) => (
	      <i className="ms-1 bi bi-question-circle" ref={ref} {...triggerHandler}></i>
	    )}
	  </OverlayTrigger>
	</Form>
	<ListGroup>
	  {kindApps?.map(a => (
	    <NostrApp key={a.pubkey} app={a} getUrl={getUrl} select={onSelect} />
	  ))}
	</ListGroup>
      </div>
      <div className="mt-5">
	<h2>New here?</h2>
	<Button href="/about" size="lg" variant="outline-primary">What is NostrApp.Link?</Button>
      </div>
      <div className="mt-5">
	<h2>New to Nostr?</h2>
	<Button href="https://nosta.me" size="lg" variant="outline-primary">Get started</Button>
	<Button href="https://heynostr.com" size="lg" variant="outline-secondary" className="ms-2">Learn more</Button>
      </div>
    </main>
  );
};

export default Body;
