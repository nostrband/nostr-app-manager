import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import { Link } from 'react-router-dom';
import './AppSelectItem.scss';
import * as cmn from '../common';
import OtherApp from '../icons/OtherApp';
import Profile from './Profile';
import Edit from '../icons/Edit';
import UserAvatars from './UserAvatars';
import { isPhone } from '../const';
import Typography from '@mui/material/Typography';

const AppSelectItem = (props) => {
  const { showMenuButton, toggleFullList, defaultApp, appOnEventAppsPage } =
    props;
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

  const onToggleFullList = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFullList();
  };

  console.log(app.display_name === 'Yana' && app.about);

  return (
    <>
      <ListGroup.Item className="position-relative d-flex justify-content-between align-items-start p-0">
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
                  {showMenuButton && (
                    <strong className="pb-1 pointer" onClick={onToggleFullList}>
                      ...
                    </strong>
                  )}
                </div>
                {isPhone ? (
                  <p
                    style={{
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: '2',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginBottom: '0px',
                      wordWrap: 'break-word',
                      wordBreak: 'break-all',
                    }}
                  >
                    {about}
                  </p>
                ) : (
                  <p
                    style={{
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: '2',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginBottom: '0px',
                    }}
                  >
                    {about}
                  </p>
                )}

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
          {appOnEventAppsPage && props.app.users.length > 0 ? (
            <UserAvatars users={props.app.users} />
          ) : null}
        </Link>
        {props.myApp && (
          <div className="edit-button" onClick={props.selecteAppForEdit}>
            <Edit />
          </div>
        )}
      </ListGroup.Item>
    </>
  );
};

export default AppSelectItem;
