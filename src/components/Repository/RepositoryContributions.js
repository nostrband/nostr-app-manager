import React from 'react';
import Profile from '../../elements/Profile';
import { ListGroup, ListGroupItem } from 'react-bootstrap';

const RepositoryContributions = ({ contributors }) => {
  return (
    <li>
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
                <strong className="mx-1 ">({r.countContributions})</strong>
              </div>
            </ListGroupItem>
          );
        })}
      </ListGroup>
    </li>
  );
};

export default RepositoryContributions;
