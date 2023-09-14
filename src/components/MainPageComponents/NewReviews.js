import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as cmn from '../../common';
import { useNewReviewState } from '../../context/NewReviesContext';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import Profile from '../../elements/Profile';
import { Rating } from '@mui/material';
import LoadingSpinner from '../../elements/LoadingSpinner';
import './NewReviews.scss';
import { Link } from 'react-router-dom';
import Zap from '../../icons/Zap';
import AnswerIcon from '../../icons/AnswerIcon';
import { useAuth } from '../../context/AuthContext';
import ReviewLike from '../App/Reviews/ReviewLike';
import { nip19 } from '@nostrband/nostr-tools';
import ZapFunctional from './ZapFunctional';

function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

const NewReviews = () => {
  const { newReview, empty, fetchReviews, setNewReview, updateState } =
    useNewReviewState();
  const { reviews, loading, lastCreatedAt, hasMore, scrollPosition } =
    newReview;
  const { pubkey } = useAuth();
  const prevPubkey = usePrevious(pubkey);
  const [updateLike, setUpdateLike] = useState('FALSE');
  const zapButtonRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: scrollPosition, behavior: 'instant' });
  }, []);

  const handleScroll = useCallback(() => {
    if (hasMore && lastCreatedAt) {
      const scrollBottom = Math.abs(
        document.documentElement.scrollHeight -
          (window.innerHeight + document.documentElement.scrollTop)
      );
      updateState({ scrollPosition: window.scrollY });
      if (scrollBottom < 10 && !empty) {
        fetchReviews(lastCreatedAt);
      }
    }
  }, [loading, hasMore, lastCreatedAt, fetchReviews]);

  useEffect(() => {
    async function handleLikesUpdate() {
      let updatedReviews;
      if (pubkey) {
        updatedReviews = await cmn.associateLikesWithReviews(reviews);
      } else {
        updatedReviews = reviews.map((review) => ({
          ...review,
          like: false,
        }));
      }
      setNewReview({ ...newReview, reviews: updatedReviews });
    }
    if (prevPubkey !== pubkey || updateLike) {
      handleLikesUpdate();
    }
  }, [pubkey, prevPubkey, updateLike]);

  useEffect(() => {
    if (reviews.length > 0) {
      fetchReviews(lastCreatedAt);
    } else {
      fetchReviews();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, loading, lastCreatedAt]);

  const getUrl = (h) => cmn.formatAppUrl(cmn.getNaddr(h));

  useEffect(() => {
    if (zapButtonRef.current) {
      window.nostrZap.initTarget(zapButtonRef.current);
    }
  }, []);

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
                    <ReviewLike
                      like={review.like}
                      countLikes={review.countLikes}
                      setUpdateLike={setUpdateLike}
                      review={review}
                    />
                    <ZapFunctional
                      npub={nip19?.npubEncode(review.pubkey)}
                      noteId={nip19.noteEncode(review.id)}
                    />
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
