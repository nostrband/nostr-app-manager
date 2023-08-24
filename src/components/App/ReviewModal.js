import React, { useRef, useEffect, useState } from 'react';
import { Rating } from '@mui/material';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Toast from '../../elements/Toast';
import { toast } from 'react-toastify';
import * as cmn from '../../common';

const ReviewModal = ({
  showModal,
  handleCloseModal,
  app,
  review,
  countReview,
  setCountReview,
  hasReview,
}) => {
  const textRef = useRef();
  const [showToast, setShowToast] = useState(false);
  const [reviewText, setReviewText] = useState(review.content || '');

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
      }
    } catch (error) {
      toast.update(toastId, {
        render: 'Error sending review.',
        type: 'error',
        autoClose: 3000,
      });
    }
  };

  const editReviewQuery = async () => {
    const event = {
      kind: 5,
      pubkey: review.pubkey,
      tags: [['e', review.id]],
      content: 'Delete review',
    };
    try {
      const result = await cmn.publishEvent(event);
      if (result) {
        sendReviewQuery();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addReviewOrEdit = () => {
    if (review) {
      editReviewQuery();
    } else {
      sendReviewQuery();
    }
  };

  const cancelHandler = () => {
    handleCloseModal(false);
    hasReview();
  };

  return (
    <Modal show onHide={cancelHandler}>
      <Toast
        animation
        delay={3}
        show={showToast}
        onClose={() => setShowToast(false)}
      >
        <p className="text-sucess">Sent!</p>
      </Toast>
      <Modal.Header closeButton>
        <Modal.Title>Leave a review</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div class="form-group">
          <textarea
            placeholder="Type your review here"
            ref={textRef}
            style={{ minHeight: '60px' }}
            onChange={(e) => setReviewText(e.target.value)}
            class="form-control"
            id="exampleFormControlTextarea1"
          >
            {reviewText}
          </textarea>
          <div className="mt-3">
            <Rating
              name="review-rating"
              value={countReview}
              onChange={setRating}
            />
          </div>
        </div>
        <div className="d-flex justify-content-center mt-3">
          <Button onClick={cancelHandler} variant="secondary" className="w-50">
            Cancel
          </Button>
          <Button
            onClick={addReviewOrEdit}
            variant="primary"
            className="w-50 ms-3 "
          >
            {review ? 'Edit' : 'Submit'}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ReviewModal;
