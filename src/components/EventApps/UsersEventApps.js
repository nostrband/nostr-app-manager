import React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import Profile from '../../elements/Profile';
import * as cmn from '../../common';

const UsersEventApps = ({ users }) => {
  return (
    <ListGroup>
      {users.map((user) => {
        let profile = user?.content ? cmn.convertContentToProfile([user]) : {};
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
  );
};

export default UsersEventApps;
