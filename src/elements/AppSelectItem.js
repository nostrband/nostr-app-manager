import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import { Link } from 'react-router-dom';
import './AppSelectItem.scss';
import * as cmn from '../common';
import OtherApp from '../icons/OtherApp';
import Profile from './Profile';
import Edit from '../icons/Edit';

const AppSelectItem = (props) => {
  const { showMenuButton, toggleFullList, defaultApp } = props;
  const app = props.app?.profile;
  const getUrl = props.getUrl || ((h) => cmn.formatAppUrl(cmn.getNaddr(h)));
  const onSelect = props.onSelect || (() => {});

  let used = '';
  if (props.app?.forKinds) {
    const sortedKinds = props.app.forKinds.sort((a, b) =>
      cmn.getKindLabel(a).localeCompare(cmn.getKindLabel(b))
    );
    used = sortedKinds.map((k) => cmn.getKindLabel(k)).join(', ');
  }

  const showKinds = props.showKinds && props.app?.forKinds;
  let about = app?.about;
  if (defaultApp && about?.length > 150) {
    about = about.substring(0, 150) + '...';
  } else if (about?.length > 200) {
    about = about.substring(0, 200) + '...';
  }

  return (
    <>
      <ListGroup.Item className="position-relative d-flex justify-content-between align-items-start">
        <Link
          className="link"
          to={getUrl(props.app)}
          onClick={(e) => onSelect(props.app, e)}
        >
          <div className="card-item">
            <Col xs="auto">
              {app.picture && (
                <img
                  style={{
                    borderRadius: props.borderRadiusLogo
                      ? props.borderRadiusLogo
                      : '',
                  }}
                  alt=""
                  width="64"
                  height="64"
                  src={app.picture}
                />
              )}
              {!app.picture && <OtherApp />}
            </Col>
            <Col>
              <div className="ms-2 me-auto">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="fw-bold">
                    {defaultApp ? 'Open in' : ''}
                    <span className={defaultApp ? 'mx-1' : ''}>
                      {app.display_name || app.name}
                    </span>
                  </div>
                </div>
                <p>{about}</p>
                {showKinds && (
                  <div>
                    <small className="text-muted">Used for: {used}</small>
                  </div>
                )}
                {props.showAuthor && props.app?.meta && (
                  <div className="d-flex justify-content-end ">
                    <Profile
                      profile={props.app?.meta}
                      small={true}
                      pubkey={props.app?.pubkey}
                    />
                  </div>
                )}
              </div>
            </Col>
          </div>
        </Link>
        {showMenuButton ? (
          <strong className="pb-1 pointer" onClick={toggleFullList}>
            ...
          </strong>
        ) : null}
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
