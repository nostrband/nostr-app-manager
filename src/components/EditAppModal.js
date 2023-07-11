import React, { useEffect, useState } from 'react';
import * as cmn from '../common';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { ListGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import AppSelectItem from '../elements/AppSelectItem';

const EditAppModal = ({
  selectedApp,
  openModal,
  handleEditClose,
  getRecomnsQuery,
}) => {
  // const params = useParams();
  // const npub = (params.npub ?? '').toLowerCase();

  const [kinds, setKinds] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  // console.log(JSON.stringify(selectedApp), 'SELECTED APP');
  console.log(selectedApp, 'SELECTED APP');

  useEffect(() => {
    setKinds(selectedApp.kinds);
    setPlatforms(selectedApp.app.platforms);
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
      setPlatforms((prev) => prev.filter((x) => x !== e.target.value));
    } else {
      setPlatforms((prev) => [...prev, e.target.value]);
    }
  };

  const handleEditSave = async () => {
    const addedKinds = kinds.filter((k) => !selectedApp.kinds.includes(k));
    const removedKinds = selectedApp.kinds.filter((k) => !kinds.includes(k));
    const removedPlatforms = selectedApp.app.platforms.filter(
      (p) => !platforms.includes(p)
    );

    if (removedPlatforms) {
      const result = await cmn.removePlatformsFromUserEvents(
        selectedApp.app,
        removedPlatforms
      );
    }

    if (addedKinds) {
      const result = await cmn.publishRecomms(
        selectedApp.app,
        addedKinds,
        selectedApp.app.platforms
      );
    }
    if (removedKinds) {
      const result = await cmn.removeKindsFromApp(
        selectedApp.app,
        removedKinds
      );
    }

    handleEditClose();
    getRecomnsQuery();
  };
  console.log(selectedApp?.app?.platforms, 'something');
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
          {selectedApp?.app?.kinds.map((k) => {
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
          {selectedApp?.app?.platforms.map((platform) => {
            return (
              <ListGroup.Item key={platform}>
                <Form.Check
                  type="switch"
                  value={platform}
                  checked={platforms?.includes(platform) ? 'checked' : ''}
                  onChange={handleOffPlatform}
                  data-type="platform"
                  label={platform}
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
