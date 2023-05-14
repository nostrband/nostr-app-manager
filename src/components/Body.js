import { useState, useEffect, useCallback } from "react";
import * as qs from 'native-querystring';

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

import * as cmn from "../common"

const Body = () => {
  const [ndk, setNDK] = useState(null);
  const [addr, setAddr] = useState({});
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [appSettings, setAppSettings] = useState({});
  const [kindApps, setKindApps] = useState([]);
  const [savedApp, setSavedApp] = useState("");
  const [env, setEnv] = useState({});
  const [remember, setRemember] = useState(true);

  const getApp = (pubkey) => {
    for (const a of cmn.apps) {
      if (a.pubkey === pubkey)
	return a;
    }
    return null;
  };

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
    // console.log("loading event by filter", filter);
 
    const reqs = [n.fetchEvent(filter)];
    if (addr.hex) {
      const profile_filter: NDKFilter = {
	kinds: [0],
	authors: [addr.event_id]
      };
      // console.log("loading profile by filter", profile_filter);
      reqs.push(n.fetchEvent(profile_filter));
    }

    const e = await Promise.any(reqs);
    console.log("event", e);
    return e;
  }

  const getUrl = (app, ad) => {
    if (!ad)
      ad = addr;

    let url = ad.kind ? app.event_url : app.profile_url;
    if (ad?.kind === 0) {
      const npub = nip19.npubEncode(ad.pubkey);
      const nprofile = nip19.nprofileEncode({ pubkey: ad.pubkey, relays: ad.relays });
      url = url
	.replaceAll ("{npub}", npub)
	.replaceAll ("{nprofile}", nprofile)
	.replaceAll ("{pubkey}", ad.pubkey)
      ;
    } else if (url) {
      if (ad.kind >= 30000 && ad.kind < 40000) {
	const naddr = nip19.naddrEncode({
	  identifier: ad.d_tag || "",
	  pubkey: ad.pubkey,
	  kind: ad.kind,
	  relays: ad.relays
	});
	url = url
	  .replaceAll ("{naddr}", naddr)
	  .replaceAll ("{addr}", naddr);
      } else if (ad.event_id) {
	const note = nip19.noteEncode(ad.event_id);
	const nevent = nip19.neventEncode({
	  // FIXME add kind!
	  id: ad.event_id, relays: ad.relays, author: ad.pubkey });
	url = url
	  .replaceAll ("{note}", note)
	  .replaceAll ("{nevent}", nevent)
	  .replaceAll ("{addr}", nevent)
	  .replaceAll ("{event_id}", ad.event_id);
      }
    }

    return url;
  };

  const init = useCallback(async () => {
    
    const params = window.location.hash;
    if (!params)
    {
      console.log("No params");
      setAddr(null);
      setEvent(null);
      return;
    }

    const id = params.split('#')[1].split('?')[0];
    console.log("id", id);

    const q = qs.parse(params.split('?')[1]);
//    console.log("q", q);

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
    
    const appPlatform = cmn.getPlatform();

    // load local settings
    const appSettings = cmn.readAppSettings();
    console.log("appSettings", appSettings);

    // do we have an app from settings?
    let savedApp = "";
    if (addr.kind !== undefined) {
      savedApp = cmn.getSavedApp(addr.kind, appPlatform, appSettings);
//      console.log("kind", addr.kind, "app_pubkey", savedApp);
      if (!select) {
	const app = getApp(savedApp);
	if (app) {
	  const url = getUrl(app, addr);
	  console.log("Auto redirect url", url);
	  window.location.href = url;
	  return;
	}
      }

      // clear
      savedApp = "";
    }

    let event = null;
    if (select || !savedApp || addr.kind === undefined) {
      const relays = ["wss://relay.nostr.band", "wss://nos.lol", "wss://nostr.mutinywallet.com"];
      if (addr.relays)
	relays.push(...addr.relays);
      const n = new NDK({ explicitRelayUrls: relays });
      setNDK(n);
      console.log("ndk connecting...");
      await n.connect();

      event = await fetch(n, addr);
      if (event) {

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
	console.log("event addr", addr);

	savedApp = cmn.getSavedApp(addr.kind, appPlatform, appSettings);
	if (!select) {
	  const app = getApp(savedApp);
	  if (app) {
	    const url = getUrl(app, addr);
	    console.log("Auto redirect url", url);
	    window.location.href = url;
	    return;
	  }
	}

	// get author?
	const author = n.getUser({
	  hexpubkey: event.pubkey
	});
	await author.fetchProfile();
	// console.log("author", author.profile);
	event.author = author.profile;

      } else {
	setError("Failed to find the event " + id);
      }
    }
    
    let kindApps = [];
    for (const a of cmn.apps) {
      if (!a.platforms.includes (appPlatform) && !a.platforms.includes ("web"))
	continue;

      if (a.kinds.includes (addr.kind)) {
	kindApps.push(a);
      } else {
	for (const k of a.kinds) {
	  if (typeof k !== "string")
	    continue;

	  const range = k.split("-");
	  if (range.length === 1 && (addr.kind + "") === k) {
	    kindApps.push(a);
	  } else {
	    if ((!range[0].length || Number(range[0]) <= addr.kind)
		&& (!range[1].length || Number(range[1]) >= addr.kind)) {
	      kindApps.push(a);
	    }
	  }
	}
      }
    }

    setAddr(addr);
    setEvent(event);
    setSavedApp(savedApp);
    setKindApps(kindApps);
    setRemember(!savedApp || !getApp(savedApp));
    setAppSettings(appSettings);
    setEnv ({appPlatform});
    
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

  // save the app in local settings for this platform
  const onSelect = (a) => {
    console.log("select", a);
    if (!remember)
      return;

    if (!appSettings.kinds)
      appSettings.kinds = {};
    if (!appSettings.kinds[event.kind])
      appSettings.kinds[event.kind] = {};
    if (!appSettings.kinds[event.kind].platforms)
      appSettings.kinds[event.kind].platforms = {};
    if (!appSettings.kinds[event.kind].platforms[env.appPlatform])
      appSettings.kinds[event.kind].platforms[env.appPlatform] = {};
    appSettings.kinds[event.kind].platforms[env.appPlatform].app = a.pubkey;

    cmn.writeAppSettings(appSettings);
  };

  const app = savedApp ? getApp(savedApp) : null;

  return (
    <main className="mt-5">
      <div>
	{(event && (
	  <>
	    <h2>Choose a Nostr app to view {cmn.getKindLabel(event?.kind)}:</h2>
	    <div>
	      <Event event={event} />
	    </div>
	  </>
	)) || error || "Loading..."}
      </div>

      {(app && (
	<div className="mt-5">
	  <h2>Saved app:</h2>
	  <ListGroup>
	    <NostrApp key={app.pubkey} app={app} getUrl={getUrl} select={onSelect} />
	  </ListGroup>
	</div>
      ))}

      {event && (
	<div className="mt-5">
	  <h2>Suggested apps:</h2>
	  <Form>
	    <Form.Check
              type="switch"
              id="remember-app"
              checked={remember ? "checked" : ""}
              onChange={e => setRemember(e.target.checked)}
              label={cmn.getRememberLabel(event?.kind, env?.appPlatform)}
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
	    {kindApps?.map(a => {
	      if (!app || a.pubkey !== app.pubkey)
		return <NostrApp key={a.pubkey} app={a} getUrl={getUrl} select={onSelect} />
	      else
		return <></>
	    })}
	  </ListGroup>
	</div>
      )}
      <div className="mt-5">
	<h2>New here?</h2>
	<Button href="/about" size="lg" variant="outline-primary">Learn about Nostr App Manager</Button>
      </div>
      <div className="mt-5">
	<h2>New to Nostr?</h2>
	<Button href="https://nosta.me" size="lg" variant="outline-primary">Get started</Button>
	<Button href="https://www.heynostr.com" size="lg" variant="outline-secondary" className="ms-2">Learn more</Button>
      </div>
    </main>
  );
    };

export default Body;
