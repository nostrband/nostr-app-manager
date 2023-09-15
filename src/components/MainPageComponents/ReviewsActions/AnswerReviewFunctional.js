import React, { useRef, useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import * as cmn from '../../../common';
import AnswerIcon from '../../../icons/AnswerIcon';
import TextAreaAutosize from 'react-textarea-autosize';
import { useAuthShowModal } from '../../../context/ShowModalContext';

const AnswerReviewFunctional = ({ review }) => {
  const [showModal, setShowModal] = useState(false);
  const textRef = useRef();
  const [textForShare, setTextForShare] = useState('');
  const loginPubkey = cmn.getLoginPubkey() ? cmn.getLoginPubkey() : '';
  const { setShowLogin } = useAuthShowModal();

  useEffect(() => {
    if (textRef && textRef.current) {
      textRef.current.style.height = '0px';
      const taHeight = textRef.current.scrollHeight;
      textRef.current.style.height = taHeight + 'px';
    }
  }, [textForShare, showModal]);

  const openAnswerReviewModalOrAuthModal = () => {
    if (loginPubkey) {
      setShowModal(true);
    } else {
      setShowLogin(true);
    }
  };

  const handleCloseModal = () => {
    setTextForShare('');
    setShowModal(false);
  };

  const submitReviewReply = async () => {
    try {
      const event = {
        kind: 1,
        tags: [
          ['p', review.pubkey],
          ['e', review.id],
        ],
        content: textForShare,
      };
      const result = await cmn.publishEvent(event);
      if (result) {
        handleCloseModal();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <AnswerIcon onClick={openAnswerReviewModalOrAuthModal} />
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Respond to the review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div class="form-group">
            <TextAreaAutosize
              placeholder="Write your reply to this review"
              id="description"
              minRows={2}
              className="form-control"
              name="description"
              value={textForShare}
              onChange={(e) => {
                setTextForShare(e.target.value);
              }}
            />
          </div>
          <div className="d-flex justify-content-center mt-3">
            <Button
              onClick={handleCloseModal}
              variant="secondary"
              className="w-50"
            >
              Cancel
            </Button>
            <Button
              onClick={submitReviewReply}
              variant="primary"
              className="w-50 ms-3 "
            >
              Respond
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AnswerReviewFunctional;