import React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import Profile from './Profile';
import * as cmn from '../common';

const EventUsers = ({ event, users }) => {
  let titleEvent = event?.tags
    ?.filter((tag) => tag[0] === 'name')
    ?.map((tag) => tag[1])[0];

  return (
    <div>
      <h3>{titleEvent}</h3>
      <ListGroup>
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
        <span className="mx-1 mt-2">
          And <strong>{users.countOfOtherUsers}</strong> more profiles
        </span>
      ) : null}
    </div>
  );
};

export default EventUsers;
