import React from 'react';
import { Col, Container, ListGroup, Row, Spinner } from 'react-bootstrap';
import AppSelectItem from '../../elements/AppSelectItem';

const NewApps = ({ allApps }) => {
  return (
    <div>
      <h3>New apps:</h3>
      <Container className="ps-0 pe-0">
        <Row>
          <Col>
            {allApps === null && (
              <div className="d-flex justify-content-center">
                <Spinner className="text-primary" />
              </div>
            )}
            {allApps != null && !allApps.length && 'Nothing found on relays.'}
            {allApps && (
              <ListGroup>
                {allApps.map((a) => {
                  return <AppSelectItem key={a.id} app={a} showAuthor={true} />;
                })}
              </ListGroup>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NewApps;
