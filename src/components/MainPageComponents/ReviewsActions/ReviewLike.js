import React from 'react';
import Heart from '../../../icons/Heart';
import * as cmn from '../../../common';
import { useAuthShowModal } from '../../../context/ShowModalContext';
import LikedHeart from '../../../icons/LikedHeart';
import { useNewReviewState } from '../../../context/NewReviewsContext';
import { toast } from 'react-toastify';
import { KIND_LIKE, KIND_REMOVE_EVENT } from '../../../const';

const ReviewLike = ({
  review,
  setUpdateLike,
  countLikes,
  like,
  setReviews,
  reviews,
  appInfo,
}) => {
  const { setShowLogin } = useAuthShowModal();
  const loginPubkey = cmn.getLoginPubkey() ? cmn.getLoginPubkey() : '';
  const { newReview, updateState } = useNewReviewState();

  const updateLikeReviews = (reviews, key, setState) => {
    const updatedReviews = reviews.map((r) => {
      if (r.id === review.id) {
        return {
          ...r,
          like: false,
          countLikes: r.countLikes - 1,
        };
      }
      return r;
    });
    setState({ [key]: updatedReviews });
  };

  const handleLike = async () => {
    if (cmn.isAuthed()) {
      if (!like) {
        const toastId = toast('Loading...', {
          type: 'pending',
          autoClose: false,
        });
        const event = {
          kind: KIND_LIKE,
          tags: [
            ['p', loginPubkey, 'wss://relay.nostr.band'],
            ['e', review.id, 'wss://relay.nostr.band'],
          ],
          content: '+',
        };
        try {
          const response = await cmn.publishEvent(event);
          if (response) {
            setUpdateLike((prev) => (prev === 'FALSE' ? 'TRUE' : 'FALSE'));
            if (appInfo) {
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
            setTimeout(() => {
              toast.update(toastId, {
                render: 'You liked!',
                type: 'success',
                autoClose: 2000,
              });
            }, 1300);
          }
        } catch (error) {
          console.error('Error publishing like:', error);
        }
      } else {
        const eventForDelete = {
          kind: KIND_REMOVE_EVENT,
          pubkey: loginPubkey,
          tags: [['e', like.id]],
          content: 'Deleting the app',
        };
        try {
          const result = await cmn.publishEvent(eventForDelete);
          if (result) {
            if (appInfo) {
              updateLikeReviews(reviews.reviewsData, 'reviewsData', setReviews);
            }
            updateLikeReviews(newReview.reviews, 'reviews', updateState);
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
