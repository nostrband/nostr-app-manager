import React, { useState, useEffect } from 'react';
import Heart from '../../../icons/Heart';
import * as cmn from '../../../common';
import { useAuthShowModal } from '../../../context/ShowModalContext';
import LikedHeart from '../../../icons/LikedHeart';
import { useNewReviewState } from '../../../context/NewReviesContext';

const ReviewLike = ({ review, appInfo }) => {
  const [like, setLike] = useState(review.like);
  const [countLikes, setCountLikes] = useState(review.countLikes);
  const { setShowLogin } = useAuthShowModal();
  const loginPubkey = cmn.getLoginPubkey() ? cmn.getLoginPubkey() : '';
  const { newReview, updateState } = useNewReviewState();
  console.log(newReview, 'NEW REVIEW');
  useEffect(() => {
    setLike(review.like);
    setCountLikes(review.countLikes);
  }, [review]);

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
            setLike({ id: review.id });
            setCountLikes((prev) => prev + 1);

            const updatedReviews = newReview.reviews.map((r) => {
              if (r.id === review.id) {
                return {
                  ...r,
                  like: { id: review.id },
                  countLikes: r.countLikes + 1,
                };
              }
              return r;
            });
            updateState({ reviews: updatedReviews });
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
            setCountLikes((prev) => prev - 1);
            const updatedReviews = newReview.reviews.map((r) => {
              if (r.id === review.id) {
                return {
                  ...r,
                  like: false,
                  countLikes: r.countLikes - 1,
                };
              }
              return r;
            });

            updateState({ reviews: updatedReviews });
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
      <span className="count-likes">
        {countLikes !== 0 ? countLikes : null}
      </span>
      {like ? (
        <LikedHeart onClick={handleLike} />
      ) : (
        <Heart onClick={handleLike} />
      )}
    </>
  );
};

export default ReviewLike;
