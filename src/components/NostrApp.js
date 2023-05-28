import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

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
    <ListGroup.Item className="app-row">
    <Row>
      <Col xs="auto">
	{props.getUrl && (
	  <a className="stretched-link" href={props.getUrl(app)} onClick={() => props.select(app)}>
	    {app.picture && (<img alt="{app.name}" width="64" height="64" src={app.picture} />)}
	    {!app.picture && (<OtherApp />)}
	  </a>
	)}
        {showKinds && (
	  <a href='#' className="stretched-link" onClick={(e) => { e.preventDefault(); props.select(app); }}>
	    {app.picture && (<img alt="{app.name}" width="64" height="64" src={app.picture} />)}
	    {!app.picture && (<OtherApp />)}
	  </a>
	)}
      </Col>
      <Col><div className="ms-2 me-auto">
	<div className="fw-bold">{app.name}</div>
	{app?.about}
	{showKinds && (
	  <div><small className="text-muted">Used for: {used}</small></div>
	)}
      </div>
      </Col>
    </Row>
    </ListGroup.Item>
  )
}

export default NostrApp;
