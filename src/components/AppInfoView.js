import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";

import { nip19 } from 'nostr-tools'

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';

import Profile from "../elements/Profile"
import AppInfo from "../elements/AppInfo"

import * as cmn from "../common"
import * as cs from "../const"

const AppInfoView = () => {
  const params = useParams();
  const naddr = (params.naddr ?? "").toLowerCase();

  const [error, setError] = useState("");
  const [info, setInfo] = useState(null);
  const [addr, setAddr] = useState(null);
  const [recomms, setRecomms] = useState(null);
  const [showAddApp, setShowAddApp] = useState(false);
  const [addKinds, setAddKinds] = useState([]);
  const [addPlatforms, setAddPlatforms] = useState([]);
  const [sending, setSending] = useState(false);

  const init = useCallback(async () => {

    const {type, data} = nip19.decode(naddr);
    if (type !== "naddr") {
      setAddr(null);
      setInfo(null);
      setRecomms(null);
      return;
    }

    const addr = data;
    setAddr(addr);

    async function reload() {
      const info = await cmn.fetchApps(addr.pubkey, addr);
      setInfo(info);
      if (info === null || !Object.values(info.apps).length)
	return;

      const appInfo = Object.values(info.apps)[0].addrHandler;
      setAddKinds(appInfo.kinds);
      setAddPlatforms(appInfo.platforms);
      
      cmn.fetchRecomms(addr).then(setRecomms);
    };

    cmn.addOnNostr(reload);
    reload();
  }, [naddr]); 

  // on the start
  useEffect(() => {
    init().catch(console.error);
  }, [init]);

  if (!naddr || !info || !Object.values(info.apps).length)
    return null;  

  const app = Object.values(info.apps)[0];
  const appInfo = app.addrHandler;
  
  const toggleAddKind = (kind, checked) => {
    setAddKinds(kinds => checked ? [...kinds, kind] : kinds.filter(k => k !== kind));
  };

  const toggleAddPlatform = (platform, checked) => {
    setAddPlatforms(platforms => checked ? [...platforms, platform] : platforms.filter(p => p !== platform));
  };

  async function addApp() {

    if (addKinds.length === 0 || addPlatforms.length === 0) {
      setError("Choose kinds and platforms");
      return;
    }

    if (!cmn.isAuthed()) {
      setError("Please login");
      return;
    }
    
    setSending(true);

    const lists = await cmn.fetchUserRecomms(cmn.getLoginPubkey(), addKinds);
    const events = [];
    for (const k of addKinds) {

      // template
      const event = {
	kind: cs.KIND_RECOMM,
	content: "",
      };

      const list = lists.find(l => cmn.getTagValue(l, "d", 0, "") === ""+k);
      if (list) {
	console.log("list for", k, "exits", list);
	event.tags = list.tags;
      } else {
	console.log("new list for", k);
	event.tags = [
	  ["d", ""+k],
	];
      }

      const a = cmn.getEventTagA(appInfo);
      let changed = false;
      for (const p of addPlatforms) {
	if (event.tags.find(t => t.length >= 4 && t[0] === "a" && t[1] === a && t[3] === p) === undefined) {
	  console.log("added to list for", k);
	  event.tags.push(["a", a, "wss://relay.nostr.band", p]);
	  changed = true;
	} 
      }
      if (changed) {
	events.push(event);
      } else {
	console.log("already on the list", k);
      }
    }
    
    console.log("events", events);
    if (events.length === 0) {
      setShowAddApp(false);
      setSending(false);
      return;
    }

    let r = null;
    for (const e of events) {
      r = await cmn.publishEvent(e);
      if (!r || r.error)
	break;
    }

    // done
    setSending(false);

    // update
    cmn.fetchRecomms(cmn.getEventAddr(appInfo)).then(setRecomms);

    // check
    if (!r || r.error) {
      setError(r ? r.error : "Failed");
    } else {
      setShowAddApp(false);
    }
  };
  
  return (
    <>
      {info && (
	<div className="mt-5">
	  <AppInfo key={appInfo.name} app={appInfo} />
	  <h6 className="mt-3">Published by:</h6>
	  <Profile profile={info.meta} pubkey={addr.pubkey} small={true} />
	  <h6 className="mt-3">Event kinds:</h6>
	  {app.kinds.map(k => {
	    return (
	      <Button key={k} size="sm" variant="outline-primary" className="me-1">{cmn.getKindLabel(k)}</Button>
	    ) 
	  })}
	  <h6 className="mt-3">Platforms:</h6>
	  {app.platforms.map(p => {
	    return (
	      <span key={p}>
		<Button key={p} size="sm" variant="outline-primary" className="me-1">{p}</Button>
	      </span>
	    ) 
	  })}
	  <h6 className="mt-3">Used by:</h6>
	  {!recomms && (<>Loading...</>)}
	  {recomms != null && !recomms.length && (<>No one yet.</>)}
	  {function () {
	    if (recomms != null && recomms.length > 0) {
	      const profiles = {};
	      recomms.map(r => profiles[r.pubkey] = r);
	      return Object.values(profiles).map(r => {
		return (
		  <Profile key={r.id} profile={r} pubkey={r.pubkey} small={true} />
		);
	      })
	    }
	  }()}
	  <div className="mt-2">
	    <Button variant="primary" onClick={e => setShowAddApp(true)}>Add app to my list</Button>
	  </div>
	</div>
      )}

    <Modal show={showAddApp} onHide={e => setShowAddApp(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Add {appInfo.display_name || appInfo.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
	<div className="text-muted">Apps in your list are visible to others and allow your followers to discover new apps.</div>
	<h3 className="mt-3">Event kinds:</h3>
	<div>
	  {app.kinds.map(k => (
	    <Form.Check type="switch" key={k} label={cmn.getKinds()[k]}
	      checked={addKinds.includes(k)} onChange={e => toggleAddKind(k, e.target.checked)} />
	  ))}
	</div>
	<h3 className="mt-3">Platforms:</h3>
	<div>
	  {app.platforms.map(p => (
	    <Form.Check type="switch" key={p} label={p}
	      checked={addPlatforms.includes(p)} onChange={e => toggleAddPlatform(p, e.target.checked)} />
	  ))}
	</div>
	{error && (
	  <Alert variant="danger">{error}</Alert>
	)}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={e => setShowAddApp(false)}>Cancel</Button>
        <Button variant="primary" disabled={sending} onClick={e => addApp()}>Add</Button>
      </Modal.Footer>
    </Modal>      

    </>
  );
}

export default AppInfoView;
