import React from 'react';
import './Applications.scss';
import { Link } from 'react-router-dom';
import defaultImage from '../images/default.png';
import * as cmn from '../common';
import Profile from '../elements/Profile';

const ApplicationItem = (props) => {
  let content = {};
  if (props.app?.content) {
    content = JSON.parse(props.app?.content);
  }
  const getUrl = (h) => cmn.formatAppUrl(cmn.getNaddr(h));
  let about = content?.about;
  if (about?.length > 50) about = about.substring(0, 50) + '...';

  return (
    <Link key={props.key} to={props.app ? getUrl(props.app) : ''}>
      <div className="card-app">
        {content?.picture?.length > 0 ? (
          <img
            className="app-logo-main"
            src={content?.picture}
            alt={content?.name}
          />
        ) : (
          <div className="default-image">
            <img src={defaultImage} alt={content?.name} />
          </div>
        )}
        <h5>{props.app.display_name || props.app.name}</h5>
        <p>{about}</p>
        <div className="d-flex justify-content-end profile">
          <Profile
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
