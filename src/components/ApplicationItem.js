import React from 'react';
import './Applications.scss';
import { Link } from 'react-router-dom';
import defaultImage from '../images/default.png';
import * as cmn from '../common';

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
        <h5>
          {props?.app?.profile?.display_name || props?.app?.profile?.name}
        </h5>
        <p>{about}</p>
      </div>
    </Link>
  );
};

export default ApplicationItem;
