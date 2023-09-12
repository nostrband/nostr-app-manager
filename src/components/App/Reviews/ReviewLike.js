import React from 'react';
import Heart from '../../../icons/Heart';
import * as cmn from '../../../common';
import { useAuthShowModal } from '../../../context/ShowModalContext';

const ReviewLike = ({ review }) => {
  const { setShowLogin } = useAuthShowModal();
  const handleLike = async () => {
    if (cmn.localGet('loginPubkey')) {
      const event = {
        kind: 7,
        tags: [['e', review.id]],
        content: '+',
      };
      try {
        const response = await cmn.publishEvent(event);
      } catch (error) {
        console.error('Error publishing like:', error);
      }
    } else {
      setShowLogin(true);
    }
  };
  return <Heart onClick={handleLike} />;
};

export default ReviewLike;
