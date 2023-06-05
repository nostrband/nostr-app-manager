import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";

import { nip19 } from 'nostr-tools'

import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

import Profile from "../elements/Profile"
import AppSelectItem from "../elements/AppSelectItem"

import * as cmn from "../common"

const ProfileView = () => {
  const params = useParams();
  const npub = (params.npub ?? "").toLowerCase();

  const [apps, setApps] = useState(null);
  const [pubkey, setPubkey] = useState("");
  const [recomms, setRecomms] = useState([]);

  const init = useCallback(async () => {

    const {type, data} = nip19.decode(npub);
    const pubkey = type === "npub" ? data : "";
    setPubkey(pubkey);
    if (!pubkey)
      return;

    const apps = await cmn.fetchApps(pubkey);
    setApps(apps);

    const recomms = await cmn.fetchUserRecommsApps(pubkey);
    setRecomms(recomms);

    // NOTE: no authed user personalization atm

  }, [npub]); 

  // on the start
  useEffect(() => {
    init().catch(console.error);
  }, [init]);

  if (!npub)
    return null;  
  
  return (
    <>
      {apps && (
	<div className="mt-5">
	  <Profile profile={apps.meta} pubkey={pubkey} />
	  <h4 className="mt-5">Published apps:</h4>
	  {!Object.keys(apps.apps).length && ("Nothing yet.")}
	  {apps.apps && (
	    <ListGroup>
	      {Object.keys(apps.apps).map(name => {
		const app = apps.apps[name];
		const h = app.handlers[0];
		return (
		  <AppSelectItem key={h.name} app={h} />
		);
	      })}
	    </ListGroup>
	  )}
	  <div className="mt-2">
	    <Link to={cmn.formatAppEditUrl("")}>
	      <Button variant="primary">Add app</Button>
	    </Link>
	  </div>

	  <h4 className="mt-5">Used apps:</h4>
	  {!recomms.length && ("Nothing yet.")}
	  {recomms.length > 0 && (
	    <ListGroup>
	      {recomms.map(r => {
		const kind = Number(cmn.getTagValue(r, "d"));

		return (
		  <div key={kind} className="mt-2">
		    <h6>{kind in cmn.getKinds() ? `${cmn.getKinds()[kind]} (kind ${kind})` : `Kind ${kind}`}</h6>
		    {Object.keys(r.apps).map(id => {
		      const a = r.apps[id];
		      return (
			<AppSelectItem key={a.id} app={a} />
		      )
		    })}
		  </div>
		);

	      })}
	    </ListGroup>
	  )}

	</div>
      )}
    </>
  );
}

export default ProfileView;
