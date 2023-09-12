import React, { useState, useEffect } from 'react';
import Heart from '../../../icons/Heart';
import * as cmn from '../../../common';
import { useAuthShowModal } from '../../../context/ShowModalContext';
import LikedHeart from '../../../icons/LikedHeart';

const ReviewLike = ({ review }) => {
  const [like, setLike] = useState(review.like);
  const { setShowLogin } = useAuthShowModal();
  const loginPubkey = cmn.getLoginPubkey() ? cmn.getLoginPubkey() : '';

  const handleLike = async () => {
    if (cmn.isAuthed()) {
      if (!like) {
        const event = {
          kind: 7,
          tags: [
            ['p', loginPubkey, 'wss://relay.nostr.band'],
            ['e', review.id, 'wss://relay.nostr.band'],
          ],
          content: '+',
        };
        try {
          const response = await cmn.publishEvent(event);
          if (response) {
            setLike(true);
          }
        } catch (error) {
          console.error('Error publishing like:', error);
        }
      } else {
        const eventForDelete = {
          kind: 5,
          pubkey: loginPubkey,
          tags: [['e', like.id]],
          content: 'Deleting the app',
        };
        try {
          const result = await cmn.publishEvent(eventForDelete);
          if (result) {
            setLike(false);
          }
        } catch (error) {
          console.error('Error publishing like:', error);
        }
      }
    } else {
      setShowLogin(true);
    }
  };

  return (
    <>
      {like ? (
        <LikedHeart onClick={handleLike} />
      ) : (
        <Heart onClick={handleLike} />
      )}
    </>
  );
};

export default ReviewLike;
