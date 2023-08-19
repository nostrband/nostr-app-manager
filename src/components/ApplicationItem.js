import React from 'react';
import './Applications.scss';
import { Link } from 'react-router-dom';
import defaultImage from '../images/default.png';
import * as cmn from '../common';
import Users from '../icons/Users';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const ApplicationItem = (props) => {
  let app = {};
  if (props.app?.profile) {
    app = props.app?.profile;
  }
  const getUrl = (h) => cmn.formatAppUrl(cmn.getNaddr(h));
  let about = app?.about;
  if (about?.length > 40) about = about.substring(0, 40) + '...';
  return (
    <Link to={props.app ? getUrl(props.app) : ''}>
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

        <div className="count-users">
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip className="tooltip-count-users">
                {props.pubkey ? 'Used by profiles you follow' : 'New users'}
              </Tooltip>
            }
          >
            <div>
              <Users />
            </div>
          </OverlayTrigger>
          <span>
            {props.pubkey ? '' : '+'}
            {props.count}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ApplicationItem;
