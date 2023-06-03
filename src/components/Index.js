import { useState, useEffect, useCallback } from "react";

import { nip19 } from 'nostr-tools'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Link } from 'react-router-dom';

import AppSelectItem from "../elements/AppSelectItem";

import * as cmn from '../common';

const Index = () => {

  const [link, setLink] = useState("");
  const [apps, setApps] = useState([]);

  const [editShow, setEditShow] = useState(false);
  const [editApp, setEditApp] = useState(null);
  const [offForKinds, setOffForKinds] = useState([]);
  const [updated, setUpdated] = useState(0);

  const handleEditClose = () => setEditShow(false);

  const get = (p, s) => {
    const r = new RegExp(p+"[a-z0-9]+");
    const a = r.exec(s);
    console.log("get", p, s, a);
    if (a === null)
      return "";
    
    try {
      const {type, data} = nip19.decode(a[0])
      console.log("nip19", a[0], type, data);
      if (type + "1" === p)
	return a[0];
    }
    catch (e) {
      return ""
    }      
  }

  const redirect = (select) => {
    if (!link)
      return;

    const id = get("npub1", link)
	    || get ("note1", link)
	    || get ("nevent1", link)
	    || get ("nprofile1", link)
	    || get ("naddr1", link)
	    || (link.length === 64 ? link : "")
    ;

    console.log("id", id);
    
    window.location.hash = "#" + id + (select ? "?select=true" : "");
  };

  const open = () => redirect(true);
  const go = () => redirect(false);

  const init = useCallback(async () => {
    const platform = cmn.getPlatform();

    const aps = cmn.readAppSettings();
    const appKinds = {};
    if (aps && aps.kinds) {
      for (const [kind, kas] of Object.entries(aps.kinds)) {
	if (platform in kas.platforms) {
	  const naddr = kas.platforms[platform].app;
	  if (!naddr.startsWith("naddr1"))
	    continue;

	  const a = cmn.naddrToAddr(naddr);
	  if (!a)
	    continue;

	  if (!(a in appKinds))
	    appKinds[a] = [Number(kind)];
	  else
	    appKinds[a].push(Number(kind));
	}
      }
    }

    const info = await cmn.fetchAppsByAs(Object.keys(appKinds));

    const apps = [];
    for (const name in info.apps) {
      const app = info.apps[name].handlers[0];
      const a = cmn.naddrToAddr(cmn.getNaddr(app));
      console.log("app", a, app);
      app.forKinds = appKinds[a];
      apps.push(app);
    }
    console.log("apps", apps);

    setApps(apps);
  }, []);

  // on the start
  useEffect(() => {
    init().catch(console.error);
  }, [init]);
  
  const onSelect = (app, e) => {
    e.preventDefault();
    
    // reset
    setOffForKinds([]);

    // launch modal
    setEditApp(app);
    setEditShow(true);
  };

  const handleOffKind = e => {
    const checked = e.target.checked;
    const value = Number(e.target.value);
    if (!checked) {
      // push selected value in list
      setOffForKinds(prev => [...prev, value]);
    } else {
      // remove unchecked value from the list
      setOffForKinds(prev => prev.filter(x => x !== value));
    }
  }

  const handleEditSave = () => {
    setEditShow(false);

    const platform = cmn.getPlatform();
    const aps = cmn.readAppSettings();

    for (const kind of offForKinds) {
      const ps = aps.kinds[kind].platforms;
      delete ps[platform];
    }

    cmn.writeAppSettings(aps);
    setUpdated(updated+1);
  }
  
  return (
    <main className="mt-5">

      <div className="mt-5">
	<h1>Paste a Nostr link to find an app:</h1>
	<Container className="ps-0 pe-0">
	  <Row>
	    <Col>
	      <Form>
		<InputGroup className="mb-3">
		  <Form.Control
		    placeholder="Enter npub, note, nevent, nprofile, naddr or any nostr app link"
		    aria-label="Nostr link"
		    aria-describedby="basic-go"
		    value={link}
		    onChange={(e) => setLink(e.target.value)}
		  />

		  <OverlayTrigger
		    placement="bottom"
		    overlay={
		      <Tooltip>
			       View event and a list of suggested apps.
		      </Tooltip>
		    }
		  >
		    <Button variant="outline-primary" id="button-go" onClick={open}>
		      Show apps
		    </Button>
		  </OverlayTrigger>
		  <OverlayTrigger
		    placement="bottom"
		    overlay={
		      <Tooltip>
			       Redirect to the app if you've already saved one. Just press 'Enter'.
		      </Tooltip>
		    }
		  >
		    <Button variant="outline-primary" id="button-go" type="submit" onClick={go}>
		      <i className="bi bi-arrow-right-short"></i>
		    </Button>
		  </OverlayTrigger>
		</InputGroup>
	      </Form>
	    </Col>
	  </Row>
	</Container>
      </div>

      <div className="mt-5">
	<h3>Apps used on this device:</h3>
	<Container className="ps-0 pe-0">
	  <Row>
	    <Col>
	      {apps && (
		<ListGroup>
		  {apps.map(a => {
		    return <AppSelectItem key={a.id} app={a} showKinds="true" onSelect={onSelect} />
		  })}
		</ListGroup>
	      )}
	      {!apps.length && (
		<>
		  No apps saved yet. Paste a link or event id to setup your first app.
		</>
	      )}
	    </Col>
	  </Row>
	</Container>
      </div>

      <div className="mt-5">
	<h3>What is Nostr App Manager?</h3>
	Discover Nostr apps, assign apps to event kinds,
	recommend apps to your followers.
	<Link to="/about"><Button variant="outline-primary">Learn more</Button></Link>
      </div>
      
      <Modal show={editShow} onHide={handleEditClose}>
	<Modal.Header closeButton>
	  <Modal.Title>Edit app</Modal.Title>
	</Modal.Header>
	<Modal.Body>
	  <ListGroup>
	    <AppSelectItem app={editApp} />
	  </ListGroup>
	  <h4 className="mt-3">Used for:</h4>
	  <ListGroup>
	    {editApp && editApp.forKinds.map(k => {
	      return (
		<ListGroup.Item key={k}>
		  <Form.Check
		    type="switch"
		    value={k}
		    checked={offForKinds.includes(k) ? "" : "checked"}
		    onChange={handleOffKind}
		    label={cmn.getKindLabel(k)}
		  />
		</ListGroup.Item>
	      )
	    })}
	  </ListGroup>
	</Modal.Body>
	<Modal.Footer>
	  <Button variant="secondary" onClick={handleEditClose}>
	    Close
	  </Button>
	  <Button variant="primary" onClick={handleEditSave}>
	    Save Changes
	  </Button>
	</Modal.Footer>
      </Modal>
      
    </main>
  );
};

export default Index;
