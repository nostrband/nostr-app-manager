import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';

import * as cmn from "../common"
import Avatar from "../icons/Avatar"

const Profile = (props) => {
  const p = props.profile?.profile;
  const pubkey = props.pubkey;
  const getUrl = props.getUrl || (pubkey => cmn.formatProfileUrl(cmn.formatNpub(pubkey)));
  const onSelect = props.onSelect || (() => {});
  const size = props.small ? 32 : 64;
  
  return (
    <Row className="position-relative">
      <Col xs="auto">
	<Link className="stretched-link" to={getUrl(pubkey)} onClick={() => onSelect(pubkey)}>
	  {p?.picture && (<img className="profile" alt={p?.name} width={size} height={size} src={p?.picture} />)}
	  {!p?.picture && (<Avatar className="profile" size={size} />)}
	</Link>
      </Col>
      <Col><div className="me-auto">
	<div className="fw-bold">{p?.display_name || p?.name || cmn.formatNpubShort(pubkey)}</div>
	<div><small className="text-muted">{p?.nip05}</small></div>
      </div>
      </Col>
    </Row>
  );
}

export default Profile;
