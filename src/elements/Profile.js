import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';
import * as cmn from '../common';
import Avatar from '../icons/Avatar';
import defaultImage from '../images/default.png';
import { useProfileImageSource } from '../hooks/useProfileImageSource';

const Profile = (props) => {
  const p = props?.profile?.profile;
  const pubkey = props?.pubkey;
  const { url: picture, viewRef } = useProfileImageSource({
    pubkey,
    originalImage: p?.picture,
  });

  const getUrl =
    props.getUrl || ((pubkey) => cmn.formatProfileUrl(cmn.formatNpub(pubkey)));
  const onSelect = props.onSelect || (() => {});
  const size = props.small ? 26 : 64;

  let name = p?.display_name || p?.name || cmn.formatNpubShort(pubkey);
  if (name?.length > 15 && props.shortName)
    name = name.substring(0, 15) + '...';

  return (
    <Row className={'profile position-relative ' + (props.small ? 'gx-1' : '')}>
      <Col xs="auto">
        <Link
          className={!props.removeLink ? 'stretched-link' : null}
          to={!props.removeLink ? getUrl(pubkey) : null}
          onClick={() => onSelect(pubkey)}
        >
          {p?.picture && (
            <img
              ref={viewRef}
              style={{
                borderRadius: props.appLogo ? '7px' : '50%',
                cursor: props.removeLink ? 'default' : 'pointer',
              }}
              alt=""
              width={size}
              height={size}
              src={picture}
            />
          )}
          {!p?.picture && !props.appLogo && (
            <Avatar className="profile" size={size} />
          )}
          {!p?.picture && props.appLogo && (
            <div className="default-image-app-review">
              <img src={defaultImage} alt="" />
            </div>
          )}
        </Link>
      </Col>
      <Col className="d-flex align-items-center">
        <div className="me-auto">
          <div className="fw-bold">{name}</div>
          {!props.small && (
            <div>
              <small className="text-muted">{p?.nip05}</small>
            </div>
          )}
        </div>
      </Col>
    </Row>
  );
};

export default Profile;
