import { useState, useEffect } from "react";

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

import NostrApp from "./NostrApp";

import * as cmn from '../common';

const Index = () => {

  const [link, setLink] = useState("");
  const [apps, setApps] = useState([]);

  const [editShow, setEditShow] = useState(false);
  const [editApp, setEditApp] = useState(null);
  const [offForKinds, setOffForKinds] = useState([]);
  const [updated, setUpdated] = useState(0);

  const handleEditClose = () => setEditShow(false);
  const handleEditShow = () => setEditShow(true);

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

  useEffect(() => {
    const platform = cmn.getPlatform();
    const aps = cmn.readAppSettings();
    const appKinds = {};
    for (const [kind, kas] of Object.entries(aps.kinds)) {
      if (platform in kas.platforms) {
	const pubkey = kas.platforms[platform].app;
	if (!(pubkey in appKinds))
	  appKinds[pubkey] = [kind];
	else
	  appKinds[pubkey].push(kind);
      }
    }

    const apps = [];
    for (const pubkey in appKinds) {
      for (const app of cmn.apps) {
	if (app.pubkey == pubkey) {
	  app.forKinds = appKinds[pubkey];
	  apps.push(app);
	}
      }
    }
    console.log("apps", apps);
    setApps(apps);
  }, [updated]);

  const onSelect = (app) => {
    // reset
    setOffForKinds([]);

    // launch modal
    setEditApp(app);
    setEditShow(true);
  };

  const handleOffKind = e => {
    const { value, checked } = e.target;
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
	<h1>Looking for an app to open a Nostr link?</h1>
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
	<h3>What is Nostr App Manager?</h3>
	Discover Nostr apps, assign apps to event kinds,
	recommend apps to your followers.
	<Button variant="outline-primary" href="/about">Learn more</Button>
      </div>

      <div className="mt-5">
	<h3>Apps used on this device:</h3>
	<Container className="ps-0 pe-0">
	  <Row>
	    <Col>
	      {apps && (
		<ListGroup>
		  {apps?.map(a => {
		    return <NostrApp key={a.pubkey} app={a} showKinds="true" select={onSelect} />
		  })}
		</ListGroup>
	      )}
	      {!apps.length && (
		<>
		  No apps saved yet. Paste a link to a nostr event above to setup your first app.
		</>
	      )}
	    </Col>
	  </Row>
	</Container>
      </div>

      <Modal show={editShow} onHide={handleEditClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit app</Modal.Title>
        </Modal.Header>
        <Modal.Body>
	  <ListGroup>
	    <NostrApp app={editApp} />
	  </ListGroup>
	  <h4 className="mt-3">Used for:</h4>
	  <ListGroup>
	    {editApp && editApp.forKinds.map(k => {
	      return (
		<ListGroup.Item key={k}>
		  <Form.Check
		    type="switch"
		    id={"kind"+k}
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
