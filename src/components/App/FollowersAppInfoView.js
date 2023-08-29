import React, { useState, useEffect } from 'react';
import * as cmn from '../../common';
import './FollowersAppInfo.scss';
import { ListGroupItem, ListGroup } from 'react-bootstrap';
import Profile from '../../elements/Profile';

const FollowersAppInfoView = ({ recomms }) => {
  return (
    <div>
      <ListGroup>
        {!recomms && <>Loading...</>}
        {recomms != null && !recomms.length && <>No one yet.</>}
        {(function () {
          if (recomms != null && recomms.length > 0) {
            const profiles = {};
            recomms.map((r) => (profiles[r.pubkey] = r));
            let list = Object.values(profiles);
            if (list.length > 10) list.length = 10;
            return list.map((r) => {
              return (
                <ListGroupItem className="darked">
                  <Profile
                    key={r.id}
                    profile={r}
                    pubkey={r.pubkey}
                    small={true}
                  />
                </ListGroupItem>
              );
            });
          }
        })()}
      </ListGroup>
    </div>
  );
};

export default FollowersAppInfoView;
