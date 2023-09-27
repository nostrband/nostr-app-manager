import React from 'react';
import { Button, ListGroup } from 'react-bootstrap';
import AppSelectItem from '../../elements/AppSelectItem';
import { Link } from 'react-router-dom';
import * as cmn from '../../common';

const Apps = ({ apps, isLogged }) => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center pb-2">
        <h4>Published apps:</h4>
        {isLogged ? (
          <div className="mt-2">
            <Link to={cmn.formatAppEditUrl('')}>
              <Button variant="primary">Add app</Button>
            </Link>
          </div>
        ) : null}
      </div>

      {!Object.keys(apps.apps).length && 'Nothing yet.'}
      {apps.apps && (
        <ListGroup>
          {Object.keys(apps.apps).map((name) => {
            const app = apps.apps[name];
            const h = app.handlers[0];
            return <AppSelectItem key={h.name} app={h} />;
          })}
        </ListGroup>
      )}
    </div>
  );
};

export default Apps;
