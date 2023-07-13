import { useState, useEffect } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

import { BoxArrowUpRight, Lightning } from 'react-bootstrap-icons';

import * as cmn from '../common';

const AppInfo = (props) => {
  const app = props.app.profile;
  const editUrl = cmn.formatAppEditUrl(cmn.getNaddr(props.app));
  const isAllowEdit = () => {
    return cmn.isAuthed() && cmn.getLoginPubkey() === props.app.pubkey;
  };

  const [allowEdit, setAllowEdit] = useState(isAllowEdit());
  useEffect(() => {
    cmn.addOnNostr(() => setAllowEdit(isAllowEdit()));
  }, [props.app]);

  return (
    <div className="AppInfo">
      <Row>
        <Col>
          <div className="me-auto">
            <h1>{app.display_name || app.name}</h1>
            {app.website && (
              <div className="text-muted">
                <BoxArrowUpRight className="me-2" />
                <Link to={app.website} target="_blank">
                  {app.website}
                </Link>
              </div>
            )}
            {app.lud16 && (
              <div className="text-muted">
                <Lightning className="me-2" />
                <span>{app.lud16}</span>
              </div>
            )}
            <div className="mt-2">{app.about}</div>
            {app.banner && (
              <div className="mt-2">
                <Link to={app.banner} target="_blank">
                  <img alt="" src={app.banner} className="banner w-100" />
                </Link>
              </div>
            )}
          </div>
        </Col>
        <Col xs="auto">
          {app.picture && (
            <img
              alt=""
              className="profile"
              width="64"
              height="64"
              src={app.picture}
            />
          )}
          {allowEdit && (
            <div className="mt-2 d-flex justify-content-center">
              <Link to={editUrl}>
                <Button size="sm" variant="outline-secondary">
                  Edit
                </Button>
              </Link>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default AppInfo;
