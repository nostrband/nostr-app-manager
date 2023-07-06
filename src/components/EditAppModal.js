import React, { useState } from 'react';
import * as cmn from '../common';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { ListGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import AppSelectItem from '../elements/AppSelectItem';
import { removeKindsFromApp } from '../common';

const EditAppModal = ({
  selectedApp,
  openModal,
  handleEditClose,
  getRecomnsQuery,
}) => {
  const [offForKinds, setOffForKinds] = useState([]);

  const handleOffKind = (e) => {
    const checked = e.target.checked;
    const value = Number(e.target.value);
    if (!checked) {
      // push selected value in list
      setOffForKinds((prev) => [...prev, value]);
    } else {
      // remove unchecked value from the list
      setOffForKinds((prev) => prev.filter((x) => x !== value));
    }
  };

  const handleEditSave = async () => {
    const removedKinds = offForKinds;
    const result = await removeKindsFromApp(selectedApp.app, removedKinds);
    if (result) {
      console.log(result, 'RESULT');
    } else {
      console.log('Changes saved successfully!');
    }
    handleEditClose();
    getRecomnsQuery();
  };

  return (
    <Modal show={openModal} onHide={handleEditClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit app</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup>
          {selectedApp?.app && <AppSelectItem app={selectedApp?.app} />}
        </ListGroup>
        <h4 className="mt-3">Used for:</h4>
        <ListGroup>
          {selectedApp.kinds &&
            selectedApp.kinds.map((k) => {
              return (
                <ListGroup.Item key={k}>
                  <Form.Check
                    type="switch"
                    value={k}
                    checked={offForKinds.includes(k) ? '' : 'checked'}
                    onChange={handleOffKind}
                    label={cmn.getKindLabel(k)}
                  />
                </ListGroup.Item>
              );
            })}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleEditClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleEditSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditAppModal;
