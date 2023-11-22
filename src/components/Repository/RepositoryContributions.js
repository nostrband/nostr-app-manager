import React from 'react';
import Profile from '../../elements/Profile';
import { ListGroup, ListGroupItem } from 'react-bootstrap';

const RepositoryContributions = ({ contributors }) => {
  return (
    <ListGroup>
      {contributors.map((r) => {
        const profile = r.content ? JSON.parse(r.content) : {};
        return (
          <ListGroupItem className="darked">
            <div className="d-flex align-items-center">
              <Profile
                key={r.id}
                profile={{ profile }}
                pubkey={r.pubkey}
                small={true}
              />
            </div>
          </ListGroupItem>
        );
      })}
    </ListGroup>
  );
};

export default RepositoryContributions;
