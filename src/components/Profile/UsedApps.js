import React, { useState } from 'react';
import { ListGroup } from 'react-bootstrap';
import AppSelectItem from '../../elements/AppSelectItem';
import EditAppModal from '../EditAppModal';
import { nip19 } from '@nostrband/nostr-tools';
import * as cmn from '../../common';

const UsedApps = ({
  recomms,
  reorganizesData,
  setSelectedApp,
  npub,
  getRecomnsQuery,
  selectedApp,
}) => {
  const [showEditModal, setShowEditModal] = useState(null);
  const pubKey = cmn.getLoginPubkey();
  const myNpubKey = pubKey ? nip19.npubEncode(pubKey) : '';

  const handleCloseModal = () => {
    setShowEditModal(null);
  };

  return (
    <>
      <h4>Used apps:</h4>
      {!recomms.length && 'Nothing yet.'}
      {recomms.length > 0 && (
        <ListGroup>
          {reorganizesData.map((group) => (
            <>
              <div key={group.name} className="mb-3">
                {group.apps.map((app) => {
                  return (
                    <>
                      <AppSelectItem
                        showKinds
                        selecteAppForEdit={() => {
                          setSelectedApp({
                            app: { ...app },
                            kinds: group.kinds,
                          });
                          setShowEditModal(app.id);
                        }}
                        myApp={myNpubKey === npub}
                        key={app.id}
                        app={{ ...app, forKinds: group.kinds }}
                      />
                      {app.id === showEditModal ? (
                        <EditAppModal
                          getRecomnsQuery={getRecomnsQuery}
                          handleEditClose={handleCloseModal}
                          openModal={app.id === showEditModal}
                          selectedApp={selectedApp}
                          setSelectedApp={setSelectedApp}
                        />
                      ) : null}
                    </>
                  );
                })}
              </div>
            </>
          ))}
        </ListGroup>
      )}
    </>
  );
};

export default UsedApps;
