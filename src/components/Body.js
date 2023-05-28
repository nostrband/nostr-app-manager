import { useState, useEffect, useCallback } from "react";
import * as qs from 'native-querystring';

import { NDKFilter } from "@nostr-dev-kit/ndk";
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
  const [addr, setAddr] = useState({});
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [appSettings, setAppSettings] = useState({});
  const [kindApps, setKindApps] = useState([]);
  const [currentApp, setCurrentApp] = useState(null);
  const [env, setEnv] = useState({});
  const [remember, setRemember] = useState(true);

  const fetch = async (ndk, addr) => {
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
 
    const reqs = [ndk.fetchEvent(filter)];
    if (addr.hex) {
      const profile_filter: NDKFilter = {
	kinds: [0],
	authors: [addr.event_id]
      };
      // console.log("loading profile by filter", profile_filter);
      reqs.push(ndk.fetchEvent(profile_filter));
    }

    const e = await Promise.any(reqs);
    console.log("event", e);
    return e;
  }

  const getUrl = (app, ad) => {
    if (!ad)
      ad = addr;

    let url = "";
    if (ad?.kind === 0) {
      url = app.profile_url;
      const npub = nip19.npubEncode(ad.pubkey);
      const nprofile = nip19.nprofileEncode({ pubkey: ad.pubkey, relays: ad.relays });
      url = url
	.replaceAll ("{npub}", npub)
	.replaceAll ("{nprofile}", nprofile)
	.replaceAll ("{pubkey}", ad.pubkey)
      ;
    } else {
      if (ad.kind >= 30000 && ad.kind < 40000) {
	url = app.naddr_url;
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
	url = app.event_url;
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
  }

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
	return null;
      }
    }

    return addr;
  }

  const redirect = (app, addr) => {
    const url = getUrl(app, addr);
    console.log("Auto redirect url", url);
    window.location.href = url;
  }

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
    console.log("query", q);

    const select = q.select === 'true';
    console.log("select", select);

    const addr = parseAddr(id);
    if (!addr)
      return;

    const appPlatform = cmn.getPlatform();
    console.log("appPlatform", appPlatform);

    // load local settings
    const appSettings = cmn.readAppSettings();
    console.log("appSettings", appSettings);

    // do we have an app from settings?
    let savedApp = "";
    if (addr.kind !== undefined) {
      savedApp = cmn.getSavedApp(addr.kind, appPlatform, appSettings);
      console.log("kind", addr.kind, "app_pubkey", savedApp);
    }

    // check cache for saved app info
    if (savedApp && !select) {
      const app = await cmn.getCachedApp(appPlatform, savedApp);
      console.log("saved app info", app);
      if (app)
	return redirect(app, addr);
    }

    // if we can't get everything from cache, start ndk
    const ndk = await cmn.getNDK();

    // if have saved app, try to get app info now
    if (savedApp && !select) {
      const app = await cmn.getApp(ndk, appPlatform, savedApp);
      console.log("saved app remote info", app);
      if (app)
	return redirect(app, addr);
    }

    // unknown event kind, or need to show the list of apps?
    let event = null;
    if (select || !savedApp || addr.kind === undefined) {

      event = await fetch(ndk, addr);
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

	// get the addr now that we know the kind
	savedApp = cmn.getSavedApp(addr.kind, appPlatform, appSettings);

      } else {

	// not found
	setError("Failed to find the event " + id);
	return;
      }
    }

    // ok, kind is known, can we redirect now?
    if (savedApp && !select) {
      const app = await cmn.getApp(ndk, appPlatform, savedApp);
      console.log("saved app remote info", app);
      if (app)
	return redirect(app, addr);
    }

    // fetch author, need to display the event
    event.author = await cmn.getAuthor(ndk, event);

    // get apps for this kind
    const kindApps = await cmn.getKindApps(ndk, appPlatform, addr.kind);

    // find the one we saved
    let currentApp = null;
    if (savedApp) {
      for (const a of kindApps) {
	if (a.id === savedApp) {
	  currentApp = a;
	  break;
	}
      }
    }

    setAddr(addr);
    setEvent(event);
    setCurrentApp(currentApp);
    setKindApps(kindApps);
    setRemember(!currentApp);
    setAppSettings(appSettings);
    setEnv ({appPlatform});
    
  }, []);

  // on the start
  useEffect(() => {
    init().catch(console.error);
    window.addEventListener("popstate",(e) => {
      init().catch(console.error);
    });
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
    appSettings.kinds[event.kind].platforms[env.appPlatform].app = a.id;

    cmn.writeAppSettings(appSettings);
  };

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

      {(currentApp && (
	<div className="mt-5">
	  <h2>Saved app:</h2>
	  <ListGroup>
	    <NostrApp key={currentApp.id} app={currentApp} getUrl={getUrl} select={onSelect} />
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
	      if (!currentApp || a.id !== currentApp.id)
		return <NostrApp key={a.id} app={a} getUrl={getUrl} select={onSelect} />
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
