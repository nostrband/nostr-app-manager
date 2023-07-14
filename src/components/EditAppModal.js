import React, { useEffect, useState } from 'react';
import * as cmn from '../common';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { ListGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import AppSelectItem from '../elements/AppSelectItem';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

const EditAppModal = ({
  selectedApp,
  openModal,
  handleEditClose,
  getRecomnsQuery,
}) => {
  const [kinds, setKinds] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPlatformsFromUserRecomms = async () => {
    setLoading(true);
    try {
      const fetchedRecomms = await cmn.fetchUserRecomms(cmn.getLoginPubkey());
      const appUrl = cmn.getEventTagA(selectedApp.app);

      const platformsSet = new Set(
        fetchedRecomms
          .flatMap((recomm) => recomm.tags)
          .filter((tag) => tag[0] === 'a' && tag[1] === appUrl)
          .map((tag) => tag[3])
      );
      const platforms = Array.from(platformsSet);
      setPlatforms(platforms);
    } catch (error) {
      console.error('Error fetching platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setKinds(selectedApp.kinds);
    fetchPlatformsFromUserRecomms();
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
    console.log({ kinds, platforms });
    if (kinds.length > 0 && platforms.length > 0) {
      const result = await cmn.publishRecomms(
        selectedApp.app,
        kinds,
        platforms,
        selectedApp.kinds
      );
      handleEditClose();
      getRecomnsQuery();
    } else {
      setError('There must be at least one kind or platform');
    }
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

        {loading ? (
          <div className="d-flex justify-content-center mt-3">
            <Spinner animation="border" className="text-primary" />
          </div>
        ) : (
          <>
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
            <ListGroup className="mb-2">
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
            {error && <Alert variant="danger">{error}</Alert>}
          </>
        )}
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
