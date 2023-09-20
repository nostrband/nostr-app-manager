import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as cmn from '../common';
import { useNewReviewState } from '../context/NewReviewsContext';
import Profile from '../elements/Profile';
import './ReviewInfo.scss';
import { Rating } from '@mui/material';
import LoadingSpinner from '../elements/LoadingSpinner';
import '../components/MainPageComponents/NewReviews.scss';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReviewLike from '../components/MainPageComponents/ReviewsActions/ReviewLike';
import { nip19 } from '@nostrband/nostr-tools';
import ZapFunctional from '../components/MainPageComponents/ReviewsActions/ZapFunctional';
import AnswerReviewFunctional from '../components/MainPageComponents/ReviewsActions/AnswerReviewFunctional';
import ReviewAnswers from '../components/MainPageComponents/ReviewsActions/ReviewAnswers';
import { useUpdateAnswersReviewState } from '../context/UpdateAnswersContext';

function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

const ReviewInfo = () => {
  const { note } = useParams();
  const { data } = nip19.decode(note);
  const { newReview, empty, fetchReviews, setNewReview } = useNewReviewState();
  const { reviews, loading, lastCreatedAt } = newReview;
  const { pubkey } = useAuth();
  const prevPubkey = usePrevious(pubkey);
  const [showAnswersReviewById, setShowAnswersById] = useState('');
  const [updateLike, setUpdateLike] = useState('FALSE');
  const zapButtonRef = useRef(null);
  const { updateAnswersMainPage } = useUpdateAnswersReviewState();

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
    async function handleAnswersUpdate() {
      let updatedReviews;
      updatedReviews = await cmn.associateAnswersWithReviews(reviews);
      setNewReview({ ...newReview, reviews: updatedReviews });
    }
    if (updateAnswersMainPage) {
      handleAnswersUpdate();
    }
  }, [updateAnswersMainPage]);

  useEffect(() => {
    if (reviews.length > 0) {
      fetchReviews(lastCreatedAt);
    } else {
      fetchReviews();
    }
  }, []);

  const getUrl = (h) => cmn.formatAppUrl(cmn.getNaddr(h));

  useEffect(() => {
    if (zapButtonRef.current) {
      window.nostrZap.initTarget(zapButtonRef.current);
    }
  }, []);

  return (
    <>
      {reviews
        ?.filter((review) => review.app)
        .filter((review) => review.id === data)
        .map((review) => {
          let count = cmn.getCountReview(review);
          let appProfile = review.app?.content
            ? cmn.convertContentToProfile([review.app])
            : {};
          let authorProfile = review.author?.content
            ? cmn.convertContentToProfile([review.author])
            : {};
          return (
            <div key={review.id} className="review-info">
              <div className="app">
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

              <div>
                <Link to={cmn.generateLinkForReviewPage(review.id)}>
                  <p>{review.content}</p>
                </Link>

                <Rating name="read-only" value={count} readOnly />
              </div>
              <div className="d-flex justify-content-between">
                <div className="author-profile">
                  <Profile
                    application
                    small
                    profile={{ profile: authorProfile }}
                    pubkey={review.pubkey}
                  />
                </div>

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
                  <AnswerReviewFunctional review={review} mainPage />
                </div>
              </div>
              {review.answers.length > 0 ? <h3>Replies:</h3> : null}
              <ReviewAnswers
                hideButton
                setShowAnswersById={() =>
                  setShowAnswersById(
                    showAnswersReviewById === review.id ? '' : review.id
                  )
                }
                answers={review.answers}
                showAnswers
              />
            </div>
          );
        })}
      {loading && !empty && reviews.length === 0 && <LoadingSpinner />}
    </>
  );
};

export default React.memo(ReviewInfo);
