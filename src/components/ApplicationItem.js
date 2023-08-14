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
        <h5>{props?.app?.name || props?.app.display_name}</h5>
      </div>
    </Link>
  );
};

export default ApplicationItem;
