import React, { useEffect, useState } from 'react';
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
  const [kinds, setKinds] = useState([]);
  const [platforms, newPlatforms] = useState([]);
  useEffect(() => {
    setKinds(selectedApp.kinds);
    newPlatforms(selectedApp.platforms);
  }, [selectedApp]);

  const handleOffKind = (e) => {
    const checked = e.target.checked;
    const value = Number(e.target.value);
    if (!checked) {
      setKinds((prev) => prev.filter((x) => x !== value));
    } else {
      setKinds((prev) => [...prev, value]);
    }
  };

  const handleOffPlatform = (e) => {
    const checked = e.target.checked;
    if (!checked) {
      newPlatforms((prev) => prev.filter((x) => x !== e.target.value));
    } else {
      newPlatforms((prev) => [...prev, e.target.value]);
    }
  };

  const handleEditSave = async () => {
    const result = await cmn.updateAppWithKindsAndPlatforms(
      selectedApp.app,
      kinds,
      platforms
    );
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
          {Object.keys(cmn.getKinds()).map((k) => {
            return (
              <ListGroup.Item key={k}>
                <Form.Check
                  type="switch"
                  value={k}
                  checked={!kinds?.includes(Number(k)) ? '' : 'checked'}
                  onChange={handleOffKind}
                  label={cmn.getKindLabel(k)}
                />
              </ListGroup.Item>
            );
          })}
        </ListGroup>
        <h4 className="mt-3">Platforms:</h4>
        <ListGroup>
          {cmn.getPlatforms().map((k) => {
            return (
              <ListGroup.Item key={k}>
                <Form.Check
                  type="switch"
                  value={k}
                  checked={!platforms?.includes(k) ? '' : 'checked'}
                  onChange={handleOffPlatform}
                  label={k}
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
