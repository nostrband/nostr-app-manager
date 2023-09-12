import React, { useCallback, useEffect, useState } from 'react';
import * as cmn from '../../common';
import { useNewReviewState } from '../../context/NewReviesContext';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import Profile from '../../elements/Profile';
import { Rating } from '@mui/material';
import LoadingSpinner from '../../elements/LoadingSpinner';
import './NewReviews.scss';
import { Link } from 'react-router-dom';
import ReviewLike from '../App/Reviews/ReviewLike';
import Zap from '../../icons/Zap';
import AnswerIcon from '../../icons/AnswerIcon';

const NewReviews = () => {
  const { newReview, empty, reloadedReviewsData, fetchReviews } =
    useNewReviewState();
  const { reviews, loading, lastCreatedAt, hasMore } = newReview;

  const handleScroll = useCallback(() => {
    if (!loading && hasMore && lastCreatedAt) {
      const scrollBottom = Math.abs(
        document.documentElement.scrollHeight -
          (window.innerHeight + document.documentElement.scrollTop)
      );
      if (scrollBottom < 10 && !empty) {
        fetchReviews(lastCreatedAt);
      }
    }
  }, [loading, hasMore, lastCreatedAt, fetchReviews]);

  useEffect(() => {
    if (reviews.length > 0) {
      fetchReviews(lastCreatedAt);
    } else {
      fetchReviews();
    }
  }, [reloadedReviewsData]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, loading, lastCreatedAt]);

  const getUrl = (h) => cmn.formatAppUrl(cmn.getNaddr(h));

  return (
    <>
      <ListGroup className="reviews-container">
        {reviews
          ?.filter((review) => review.app)
          .map((review) => {
            let count = cmn.getCountReview(review);
            let appProfile = review.app?.content
              ? cmn.convertContentToProfile([review.app])
              : {};
            let authorProfile = review.author?.content
              ? cmn.convertContentToProfile([review.author])
              : {};
            return (
              <ListGroupItem key={review.id} className="review-item darked">
                <div className="app-profile">
                  <Link to={review.app ? getUrl(review.app) : ''}>
                    {appProfile.pubkey ? (
                      <Profile
                        small
                        removeLink
                        profile={{ profile: appProfile }}
                        pubkey={appProfile.pubkey}
                      />
                    ) : null}
                  </Link>
                </div>

                <div className="rating-content-container">
                  <p>{review.content}</p>
                  <Rating name="read-only" value={count} readOnly />
                </div>
                <div className="d-flex justify-content-between">
                  <Profile
                    small
                    profile={{ profile: authorProfile }}
                    pubkey={review.pubkey}
                  />
                  <div className="container-actions-icon">
                    <ReviewLike review={review} />
                    <Zap />
                    <AnswerIcon />
                  </div>
                </div>
              </ListGroupItem>
            );
          })}
        {loading && !empty && <LoadingSpinner />}
      </ListGroup>
    </>
  );
};

export default React.memo(NewReviews);
