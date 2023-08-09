import React from 'react';
import { Col, Container, ListGroup, Row } from 'react-bootstrap';
import AppSelectItem from '../../elements/AppSelectItem';

const UsedApps = ({ apps, onSelect }) => {
  return (
    <div>
      <h3>Apps used on this device:</h3>
      <Container className="ps-0 pe-0">
        <Row>
          <Col>
            {apps && (
              <ListGroup>
                {apps.map((a) => {
                  return (
                    <AppSelectItem
                      key={a.id}
                      app={a}
                      showKinds="true"
                      onSelect={onSelect}
                    />
                  );
                })}
              </ListGroup>
            )}
            {!apps.length && (
              <>
                No apps saved yet. Paste a link or event id to setup your first
                app.
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UsedApps;
