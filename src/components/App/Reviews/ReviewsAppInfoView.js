import React, { useState, useEffect, useRef } from 'react';
import './ReviewsAppInfoView.scss';
import { Rating } from '@mui/material';
import * as cmn from '../../../common';
import { ListGroupItem, ListGroup, Button } from 'react-bootstrap';
import RatingStatistics from '../RatingStatistics';
import LoadingSpinner from '../../../elements/LoadingSpinner';
import { useReviewModal } from '../../../context/ShowReviewContext';
import Profile from '../../../elements/Profile';
import { Link } from 'react-router-dom';
import ReviewAnswers from '../../MainPageComponents/ReviewsActions/ReviewAnswers';
import ReviewLike from '../../MainPageComponents/ReviewsActions/ReviewLike';
import { useAuth } from '../../../context/AuthContext';
import ZapFunctional from '../../MainPageComponents/ReviewsActions/ZapFunctional';
import { nip19 } from '@nostrband/nostr-tools';
import AnswerReviewFunctional from '../../MainPageComponents/ReviewsActions/AnswerReviewFunctional';
import { useUpdateAnswersReviewState } from '../../../context/UpdateAnswersContext';

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

const ReviewsAppInfoView = ({ app }) => {
  const [reviews, setReviews] = useState({ reviewsData: [] });
  const [loading, setLoading] = useState(false);
  const { pubkey } = useAuth();
  const prevPubkey = usePrevious(pubkey);
  const [updateLike, setUpdateLike] = useState(false);
  const { setShowReviewModal, reviewAction } = useReviewModal();
  const [showAnswersReviewById, setShowAnswersById] = useState('');
  const { updateAnswers } = useUpdateAnswersReviewState();

  const getReviews = async (id) => {
    setLoading(true);
    const ndk = await cmn.getNDK();
    const addr = cmn.naddrToAddr(cmn.getNaddr(app));
    const addrForFilter = {
      kinds: [1985],
      '#a': [addr],
    };
    try {
      const response = await cmn.fetchAllEvents([
        cmn.startFetch(ndk, addrForFilter),
      ]);
      if (response.length > 0) {
        const pubkeys = response.map((review) => review.pubkey);
        const filter = {
          kinds: [0],
          authors: pubkeys,
        };
        try {
          const authors = await cmn.fetchAllEvents([
            cmn.startFetch(ndk, filter),
          ]);
          const reviewsData = response
            .map((review) => {
              const author = authors.find(
                (author) => author.pubkey === review.pubkey
              );
              if (author) {
                return { ...review, author };
              } else {
                return review;
              }
            })
            .filter((review) => review.id !== id);
          const reviewsWithAllLikes = await cmn.associateLikesWithReviews(
            reviewsData
          );

          const reviewsWithAnswers = await cmn.associateAnswersWithReviews(
            reviewsWithAllLikes
          );
          setReviews((prev) => ({ ...prev, reviewsData: reviewsWithAnswers }));
        } catch (error) {
          console.error('Error fetching authors:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reviewAction.type === 'EDIT') {
      getReviews(reviewAction.pubkey);
    } else if (reviewAction.type === 'DELETE' && reviewAction.pubkey) {
      setReviews((prev) => {
        const updatedReviews = prev.reviewsData.filter(
          (review) => review.pubkey !== reviewAction.pubkey
        );
        return { ...prev, reviewsData: updatedReviews };
      });
    } else if (reviewAction.type === 'GET' || reviewAction.type === 'CREATE') {
      getReviews();
    }
  }, [reviewAction]);

  useEffect(() => {
    async function handleLikesUpdate() {
      let updatedReviews;
      if (pubkey) {
        updatedReviews = await cmn.associateLikesWithReviews(
          reviews.reviewsData
        );
      } else {
        updatedReviews = reviews.reviewsData?.map((review) => ({
          ...review,
          like: false,
        }));
      }
      setReviews((prev) => ({ ...prev, reviewsData: updatedReviews }));
    }
    if (prevPubkey !== pubkey || updateLike) {
      handleLikesUpdate();
    }
  }, [pubkey, prevPubkey, updateLike]);

  useEffect(() => {
    async function handleAnswersUpdate() {
      let updatedReviews;
      updatedReviews = await cmn.associateAnswersWithReviews(
        reviews.reviewsData
      );
      setReviews((prev) => ({ ...prev, reviewsData: updatedReviews }));
    }
    if (updateAnswers) {
      handleAnswersUpdate();
    }
  }, [updateAnswers]);

  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <ListGroup className="reviews-container">
          <RatingStatistics reviews={reviews} />
          {reviews?.reviewsData?.map((review) => {
            const profile = review?.author?.content
              ? JSON.parse(review?.author?.content)
              : {};
            let count = cmn.getCountReview(review);
            return (
              <ListGroupItem key={review.pubkey} className="review-item">
                <Link
                  key={review.id}
                  to={cmn.generateLinkForReviewPage(review.id)}
                >
                  <div className="rating-content-container">
                    <p className="mx-1">{review.content}</p>
                    <Rating name="read-only" value={count} readOnly />
                  </div>
                </Link>
                <div className="d-flex justify-content-between">
                  <Profile
                    application
                    small
                    profile={{ profile }}
                    pubkey={review.pubkey}
                  />
                  <div className="container-actions-icon">
                    <ReviewLike
                      like={review.like}
                      countLikes={review.countLikes}
                      setUpdateLike={setUpdateLike}
                      review={review}
                      setReviews={setReviews}
                      reviews={reviews}
                      appInfo
                    />
                    <ZapFunctional
                      npub={nip19?.npubEncode(review.pubkey)}
                      noteId={nip19.noteEncode(review.id)}
                    />
                    <AnswerReviewFunctional review={review} />
                  </div>
                </div>
                <ReviewAnswers
                  setShowAnswersById={() =>
                    setShowAnswersById(
                      showAnswersReviewById === review.id ? '' : review.id
                    )
                  }
                  answers={review.answers}
                  showAnswers={showAnswersReviewById === review.id}
                />
              </ListGroupItem>
            );
          })}
        </ListGroup>
      )}
      <div className="mt-2">
        <Button onClick={() => setShowReviewModal(true)}>Write review</Button>
      </div>
    </div>
  );
};

export default ReviewsAppInfoView;
