import React, { useRef, useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Toast from '../../elements/Toast';
import * as cmn from '../../common';
import { toast } from 'react-toastify';

const ShareAppModal = ({
  showModal,
  selectedApp,
  handleCloseModal,
  askShareOrNorAndNavigateNext,
  setTextForShare,
  textForShare,
}) => {
  const textRef = useRef();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (textRef && textRef.current) {
      textRef.current.style.height = '0px';
      const taHeight = textRef.current.scrollHeight;
      textRef.current.style.height = taHeight + 'px';
    }
  }, [textForShare, showModal]);
  const shareApp = async () => {
    const toastId = toast('Loading...', { type: 'pending', autoClose: false });
    const event = {
      kind: 1,
      tags: [
        ['p', selectedApp.pubkey],
        ['a', cmn.naddrToAddr(cmn.getNaddr(selectedApp))],
      ],
      content: textForShare,
    };

    const authorTag = selectedApp.tags.find((tag) => tag.includes('author'));
    if (authorTag) {
      event.tags.push(['p', authorTag[1], authorTag[2]]);
    }
    const result = await cmn.publishEvent(event);
    if (result) {
      toast.update(toastId, {
        render: 'Sent!',
        type: 'success',
        autoClose: 3000,
      });
      if (askShareOrNorAndNavigateNext) {
        askShareOrNorAndNavigateNext();
      }
    } else {
      toast.dismiss(toastId);
    }
    handleCloseModal();
  };
  return (
    <Modal show={showModal} onHide={handleCloseModal}>
      <Toast
        animation
        delay={3}
        show={showToast}
        onClose={() => setShowToast(false)}
      >
        <p className="text-sucess">Sent!</p>
      </Toast>
      <Modal.Header closeButton>
        <Modal.Title>Do you want to share the app?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div class="form-group">
          <textarea
            ref={textRef}
            onChange={(e) => setTextForShare(e.target.value)}
            class="form-control"
            id="exampleFormControlTextarea1"
          >
            {textForShare}
          </textarea>
        </div>
        <div className="d-flex justify-content-center mt-3">
          <Button
            onClick={handleCloseModal}
            variant="secondary"
            className="w-50"
          >
            {askShareOrNorAndNavigateNext ? 'Skip' : 'Cancel'}
          </Button>
          <Button onClick={shareApp} variant="primary" className="w-50 ms-3 ">
            Share
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ShareAppModal;
