import { nip19 } from 'nostr-tools'
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

import * as cmn from "../common"
import OtherApp from "./OtherApp"

const NostrApp = (props) => {

  const app = props.app;
  let used = "";
  if (app.forKinds) {
    for (const k of app.forKinds) {
      if (used) used += ", ";
      used += cmn.getKindLabel(k);
    }
  }

  const showKinds = props.showKinds && app.forKinds;
  
  return (
    <ListGroup.Item>
      <Row>
	<Col xs="auto">
	  {app.picture && (<img width="64" height="64" src={app.picture} />)}
	  {!app.picture && (<OtherApp />)}
	</Col>
	<Col><div className="ms-2 me-auto">
	  <div className="fw-bold">{app.name}</div>
	  {app?.about}
	  {showKinds && (
	    <div><small className="text-muted">Used for: {used}</small></div>
	  )}
	</div>
	</Col>
	<Col xs="auto" className="justify-content-end align-self-end">
	  {props.getUrl && (
	    <Button variant="primary" size="lg"
	      href={props.getUrl(app)}
	      onClick={() => props.select(app)}
	    >
	      Open
	    </Button>
	  )}
	  {showKinds && (
	    <Button variant="primary"
	      onClick={() => props.select(app)}
	    >
	      Edit
	    </Button>
	  )}
	</Col>
      </Row>
    </ListGroup.Item>
  )
}

export default NostrApp;
