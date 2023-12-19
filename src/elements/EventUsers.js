import React from 'react';
import { Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import Profile from './Profile';
import * as cmn from '../common';

const EventUsers = ({ users }) => {
  return (
    <Col>
      <ListGroup className="mb-1">
        {users?.users?.map((user) => {
          let profile = user?.content
            ? cmn.convertContentToProfile([user])
            : {};
          return (
            <ListGroupItem className="darked">
              <Profile
                key={user.id}
                profile={{ profile }}
                pubkey={user.pubkey}
                small={true}
              />
            </ListGroupItem>
          );
        })}
      </ListGroup>
      {users.countOfOtherUsers > 0 ? (
        <span>
          And <strong>{users.countOfOtherUsers}</strong> more profiles
        </span>
      ) : null}
    </Col>
  );
};

export default EventUsers;
