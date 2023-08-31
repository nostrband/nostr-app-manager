import React, { useRef, useEffect, useState } from 'react';
import { Menu, Rating } from '@mui/material';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Toast from '../../elements/Toast';
import { toast } from 'react-toastify';
import * as cmn from '../../common';
import { useReviewModal } from '../../context/ShowReviewContext';

const ReviewModal = ({
  showModal,
  handleCloseModal,
  app,
  review,
  countReview,
  setReview,
  setCountReview,
  hasReview,
}) => {
  const textRef = useRef();
  const [showToast, setShowToast] = useState(false);
  const [reviewText, setReviewText] = useState(review.content || '');
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const { reviewAction, setReviewAction } = useReviewModal();

  const handleClick = () => {
    setShowConfirmDeleteModal(true);
  };

  const handleClose = () => {
    setShowConfirmDeleteModal(false);
  };

  useEffect(() => {
    if (textRef && textRef.current) {
      textRef.current.style.height = '0px';
      const taHeight = textRef.current.scrollHeight;
      textRef.current.style.height = taHeight + 'px';
    }
  }, [reviewText, showModal]);

  useEffect(() => {
    setReviewText(review.content);
  }, [review]);

  const setRating = (event, newValue) => {
    if (newValue === null) {
      setCountReview(0);
    } else {
      setCountReview(newValue);
    }
  };

  const sendReviewQuery = async () => {
    const toastId = toast('Loading...', { type: 'pending', autoClose: false });
    const qualityValue = countReview / 5;
    const event = {
      kind: 1985,
      tags: [
        [
          'l',
          'review/app',
          'social.coracle.ontology',
          `{"quality":${qualityValue}}`,
        ],
        ['L', 'social.coracle.ontology'],
        ['p', app.pubkey],
        ['a', cmn.naddrToAddr(cmn.getNaddr(app))],
      ],
      content: reviewText,
    };
    try {
      const response = await cmn.publishEvent(event);
      if (response) {
        toast.update(toastId, {
          render: review
            ? 'Successfully modified a review.'
            : 'Successfully added a review',
          type: 'success',
          autoClose: 3000,
        });
        handleCloseModal();
        hasReview();
        setReviewAction(
          review ? { type: 'EDIT', pubkey: review.id } : { type: 'CREATE' }
        );
        handleClose();
      }
    } catch (error) {
      toast.update(toastId, {
        render: 'Error sending review.',
        type: 'error',
        autoClose: 3000,
      });
    }
  };

  const editReviewQuery = async (edit) => {
    const event = {
      kind: 5,
      pubkey: review.pubkey,
      tags: [['e', review.id]],
      content: 'Delete review',
    };
    try {
      const result = await cmn.publishEvent(event);
      if (result && edit) {
        sendReviewQuery();
      } else if (result) {
        handleCloseModal();
        setReview(false);
        setReviewAction({ type: 'DELETE', pubkey: review.pubkey });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addReviewOrEdit = () => {
    if (review) {
      editReviewQuery(true);
    } else {
      sendReviewQuery();
    }
  };

  const cancelHandler = () => {
    handleCloseModal(false);
    hasReview();
  };

  return (
    <>
      <Modal show onHide={cancelHandler}>
        <Toast
          animation
          delay={3}
          show={showToast}
          onClose={() => setShowToast(false)}
        >
          <p className="text-success">Sent!</p>
        </Toast>
        <Modal.Header closeButton>
          <Modal.Title>Leave a review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <textarea
              placeholder="Type your review here"
              ref={textRef}
              style={{ minHeight: '60px' }}
              onChange={(e) => setReviewText(e.target.value)}
              className="form-control"
              id="exampleFormControlTextarea1"
              value={reviewText}
            />
            <div className="mt-3">
              <Rating
                name="review-rating"
                value={countReview}
                onChange={setRating}
              />
            </div>
          </div>
          {review ? (
            <button className="delete-review-button" onClick={handleClick}>
              Delete this review?
            </button>
          ) : null}
          <div className="d-flex justify-content-center mt-3">
            <Button
              onClick={cancelHandler}
              variant="secondary"
              className="w-50"
            >
              Cancel
            </Button>
            <Button
              onClick={addReviewOrEdit}
              variant="primary"
              className="w-50 ms-3"
            >
              {review ? 'Edit' : 'Submit'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      <Modal show={showConfirmDeleteModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Do you want to delete the review?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="confirm-modal">
            <div className="container-button ">
              <Button
                onClick={handleClose}
                className="w-100"
                variant="outline-secondary"
              >
                Cancel
              </Button>
              <Button onClick={() => editReviewQuery(false)} className="w-100">
                Delete
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ReviewModal;
