import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import { Link } from 'react-router-dom';
import './AppSelectItem.scss';
import * as cmn from '../common';
import OtherApp from '../icons/OtherApp';
import Profile from './Profile';
import Edit from '../icons/Edit';

const AppSelectItem = (props) => {
  const app = props.app?.profile;
  const getUrl = props.getUrl || ((h) => cmn.formatAppUrl(cmn.getNaddr(h)));
  const onSelect = props.onSelect || (() => {});

  let used = '';
  if (props.app?.forKinds) {
    for (const k of props.app?.forKinds) {
      if (used) used += ', ';
      used += cmn.getKindLabel(k);
    }
  }

  const showKinds = props.showKinds && props.app?.forKinds;
  let about = app?.about;
  if (about?.length > 200) about = about.substring(0, 200) + '...';

  return (
    <>
      <ListGroup.Item className="position-relative d-flex justify-content-between align-items-center">
        <Link
          className="link"
          to={getUrl(props.app)}
          onClick={(e) => onSelect(props.app, e)}
        >
          <div style={{ display: 'flex', width: '100%', gap: '10px' }}>
            <Col xs="auto">
              {app.picture && (
                <img alt="" width="64" height="64" src={app.picture} />
              )}
              {!app.picture && <OtherApp />}
            </Col>
            <Col>
              <div className="ms-2 me-auto">
                <div className="fw-bold">{app.display_name || app.name}</div>
                {about}
                {showKinds && (
                  <div>
                    <small className="text-muted">Used for: {used}</small>
                  </div>
                )}
                {props.showAuthor && props.app?.author && (
                  <div className="d-flex justify-content-end ">
                    <Profile
                      profile={props.app?.author}
                      small={true}
                      pubkey={props.app?.pubkey}
                    />
                  </div>
                )}
              </div>
            </Col>
          </div>
        </Link>

        {props.myApp ? (
          <div className="edit-button" onClick={props.selecteAppForEdit}>
            <Edit />
          </div>
        ) : null}
      </ListGroup.Item>
    </>
  );
};

export default AppSelectItem;
