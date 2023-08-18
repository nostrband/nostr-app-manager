import React from 'react';
import './Applications.scss';
import { Link } from 'react-router-dom';
import defaultImage from '../images/default.png';
import * as cmn from '../common';
import Profile from '../elements/Profile';

const ApplicationItem = (props) => {
  let app = {};
  if (props.app?.profile) {
    app = props.app?.profile;
  }
  const getUrl = (h) => cmn.formatAppUrl(cmn.getNaddr(h));
  let about = app?.about;
  if (about?.length > 40) about = about.substring(0, 40) + '...';

  return (
    <Link key={props.key} to={props.app ? getUrl(props.app) : ''}>
      <div className="card-app">
        {app?.picture?.length > 0 ? (
          <img className="app-logo-main" src={app?.picture} alt={app?.name} />
        ) : (
          <div className="default-image">
            <img src={defaultImage} alt={app?.name} />
          </div>
        )}
        <h5>{props.app?.profile?.display_name || props.app?.profile?.name}</h5>
        <p>{about}</p>
        <div className="d-flex justify-content-end profile">
          <Profile
            shortName
            profile={props.app?.meta}
            small={true}
            pubkey={props.app?.pubkey}
          />
        </div>
      </div>
    </Link>
  );
};

export default ApplicationItem;
