import { nip19 } from 'nostr-tools'
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const NostrApp = (props) => {
  
  return (
    <ListGroup.Item>
      <Row>
	<Col xs="auto">{props.app.picture && (<img width="64" height="64" src={props.app.picture} />)}</Col>
	<Col><div className="ms-2 me-auto">
	  <div className="fw-bold">{props.app.name}</div>
	  {props.app?.about}
	</div>
	</Col>
	<Col xs="auto" className="justify-content-end align-self-end">
	  <Button variant="primary" size="lg"
	    href={props.getUrl(props.app)}
	    onClick={() => props.select(props.app)}
	  >
	    Open
	  </Button>
	</Col>
      </Row>
    </ListGroup.Item>
  )
}

export default NostrApp;
