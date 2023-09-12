import React, { useState, useEffect } from 'react';
import './ReviewsAppInfoView.scss';
import { Rating } from '@mui/material';
import * as cmn from '../../../common';
import { ListGroupItem, ListGroup, Button } from 'react-bootstrap';
import RatingStatistics from '../RatingStatistics';
import LoadingSpinner from '../../../elements/LoadingSpinner';
import { useReviewModal } from '../../../context/ShowReviewContext';
import Profile from '../../../elements/Profile';
import { Link } from 'react-router-dom';
import LikedHeart from '../../../icons/LikedHeart';
import Zap from '../../../icons/Zap';
import AnswerIcon from '../../../icons/AnswerIcon';
import ReviewLike from './ReviewLike';
import { useNewReviewState } from '../../../context/NewReviesContext';

const ReviewsAppInfoView = ({ app }) => {
  const [reviews, setReviews] = useState({ reviewsData: [] });
  const [loading, setLoading] = useState(false);
  const loginPubkey = cmn.getLoginPubkey() ? cmn.getLoginPubkey() : '';
  const { showReviewModal, setShowReviewModal, reviewAction } =
    useReviewModal();

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

          const allReviewIds = reviewsData.map((r) => r.id);
          const resultLikes = await cmn.fetchLikes(allReviewIds, loginPubkey);
          const reviewsWithLikes = reviewsData.map((review) => {
            const likeObject = resultLikes?.find((like) =>
              like.tags.some((tag) => tag[0] === 'e' && tag[1] === review.id)
            );
            return { ...review, like: likeObject || false };
          });
          const allLikes = await cmn.fetchAllLikes(allReviewIds);
          const reviewsWithAllLikes = reviewsWithLikes.map((review) => {
            const likesForThisReview = allLikes.filter((like) =>
              like.tags.some((tag) => tag[0] === 'e' && tag[1] === review.id)
            );
            return { ...review, countLikes: likesForThisReview.length };
          });

          setReviews((prev) => ({ ...prev, reviewsData: reviewsWithAllLikes }));
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
              <ListGroupItem key={review.pubkey} className="review-item darked">
                <Link key={review.id} to={cmn.generateNoteLink(review.id)}>
                  <div className="rating-content-container">
                    <p className="mx-1">{review.content}</p>
                    <Rating name="read-only" value={count} readOnly />
                  </div>
                </Link>
                <div className="d-flex justify-content-between">
                  <Profile small profile={{ profile }} pubkey={review.pubkey} />
                  <div className="container-actions-icon">
                    <ReviewLike review={review} appInfo />
                    <Zap />
                    <AnswerIcon />
                  </div>
                </div>
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