import { nip19 } from 'nostr-tools'
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const NostrApp = (props) => {

  const getUrl = () => {
    let url = props.event.kind ? props.app.event_url : props.app.profile_url;

    if (props.event?.kind === 0) {
      const npub = nip19.npubEncode(props.event.pubkey);
      const nprofile = nip19.nprofileEncode({ pubkey: props.event.pubkey, relays: props.addr.relays });
      url = url
	.replaceAll ("{npub}", npub)
	.replaceAll ("{nprofile}", nprofile)
	.replaceAll ("{pubkey}", props.event.pubkey)
      ;
    } else if (url) {
      const note = nip19.noteEncode(props.event.id);
      const nevent = nip19.neventEncode({
	// FIXME add kind!
	id: props.event.id, relays: props.addr.relays, author: props.event.pubkey });
      const naddr = nip19.naddrEncode({
	identifier: props.addr.d_tag,
	pubkey: props.event.pubkey,
	kind: props.event.kind,
	relays: props.addr.relays
      });
      url = url
	.replaceAll ("{note}", note)
	.replaceAll ("{nevent}", nevent)
	.replaceAll ("{naddr}", naddr)
	.replaceAll ("{event_id}", props.event.id);
    }

    //    window.location.href = url;
    return url;
  };

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
      <Button variant="primary" size="lg" href={getUrl()}>Open</Button></Col>
      </Row>
      </ListGroup.Item>
/*    <Card className="mb-2">
      <Card.Body>
      {props.app.picture && (<img width="64" height="64" src={props.app.picture} />)}
      <Card.Title>{props.app.name}</Card.Title>
      <Card.Text>{props.app?.about}</Card.Text>
      <Button variant="primary">Open</Button>
      </Card.Body>
    </Card>
*/
  )
}

export default NostrApp;
