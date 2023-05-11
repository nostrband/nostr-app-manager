import { useState } from "react";

import { nip19 } from 'nostr-tools'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';

const Index = () => {

  const [link, setLink] = useState("");

  const get = (p, s) => {
    const r = new RegExp(p+"[a-z0-9]+");
    const a = r.exec(s);
    console.log("get", p, s, a);
    if (a === null)
      return "";
    
    try {
      const {type, data} = nip19.decode(a[0])
      console.log("nip19", a[0], type, data);
      if (type + "1" == p)
	return a[0];
    }
    catch (e) {
      return ""
    }      
  }
  
  const open = () => {
    if (!link)
      return;

    const id = get("npub1", link)
	    || get ("note1", link)
	    || get ("nevent1", link)
	    || get ("nprofile1", link)
	    || get ("naddr1", link)
	    || (link.length == 64 ? link : "")
    ;

    console.log("id", id);
    
    window.location.hash = "#" + id;
  };
  
  return (
    <main className="mt-5">
      <div>
	<h1>Nostr App Manager</h1>
	<h4 className="text-muted">Discover Nostr apps, assign apps to event kinds,
	  recommend apps to your followers.
	</h4>
	<Button variant="outline-primary">Learn more</Button>
      </div>

      <div className="mt-5">
	<h3>Looking for an app to open a Nostr link?</h3>
	<Container className="ps-0 pe-0">
	  <Row>
	    <Col>
	      <InputGroup className="mb-3">
		<Form.Control
		  placeholder="Enter npub, note, nevent, nprofile, naddr or any nostr app link"
		  aria-label="Nostr link"
		  aria-describedby="basic-go"
		  value={link}
		  onChange={(e) => setLink(e.target.value)}
		/>
		
		<Button variant="outline-primary" id="button-go" onClick={open}>
		  Open
		</Button>
	      </InputGroup>
	    </Col>
	  </Row>
	</Container>
      </div>
      
    </main>
  );
};

export default Index;
