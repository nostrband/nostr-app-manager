import React, { useState } from 'react';
// import * as cmn from '../common';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { ListGroup } from 'react-bootstrap';
import AppSelectItem from '../elements/AppSelectItem';
import * as cmn from '../common';
import Spinner from 'react-bootstrap/Spinner';
import { useNavigate } from 'react-router-dom';
import { nip19 } from '@nostrband/nostr-tools';
import { KIND_REMOVE_EVENT } from '../const';

const ConfirmDeleteModal = ({ showModal, selectedApp, handleCloseModal }) => {
  const navigate = useNavigate();
  const npub = nip19?.npubEncode(cmn?.getLoginPubkey());
  const [loading, setLoading] = useState(false);

  const deleteAppHandler = async () => {
    const deletionEvent = {
      kind: KIND_REMOVE_EVENT,
      pubkey: selectedApp?.pubkey,
      tags: [['e', selectedApp?.id]],
      content: 'Deleting the app',
    };
    try {
      setLoading(true);
      const result = await cmn.publishEvent(deletionEvent);
      if (result) {
        setLoading(false);
        handleCloseModal();
        navigate(`/p/${npub}`);
      }
    } catch (error) {
      console.error('Failed to delete app:', error);
    }
  };

  return (
    <Modal show={showModal} onHide={handleCloseModal}>
      <Modal.Header closeButton>
        <Modal.Title>
          Are you sure you want to delete this application? It cannot be undone.
        </Modal.Title>
      </Modal.Header>
      {loading ? (
        <div className="d-flex justify-content-center mt-5 mb-5">
          <Spinner animation="border" className="text-primary" />
        </div>
      ) : (
        <Modal.Body>
          <ListGroup>
            {selectedApp && <AppSelectItem app={selectedApp} />}
          </ListGroup>
          <div className="d-flex justify-content-center mt-3">
            <Button
              onClick={handleCloseModal}
              variant="secondary"
              className="w-50 "
            >
              Cancel
            </Button>
            <Button
              onClick={deleteAppHandler}
              variant="primary"
              className="w-50 ms-3 btn-danger"
            >
              Delete
            </Button>
          </div>
        </Modal.Body>
      )}
    </Modal>
  );
};

export default ConfirmDeleteModal;
