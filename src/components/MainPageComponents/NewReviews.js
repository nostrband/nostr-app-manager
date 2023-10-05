import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as cmn from '../../common';
import { useNewReviewState } from '../../context/NewReviewsContext';
import { Container, ListGroup, ListGroupItem } from 'react-bootstrap';
import Profile from '../../elements/Profile';
import { Rating } from '@mui/material';
import LoadingSpinner from '../../elements/LoadingSpinner';
import './NewReviews.scss';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ReviewLike from './ReviewsActions/ReviewLike';
import { nip19 } from '@nostrband/nostr-tools';
import ZapFunctional from './ReviewsActions/ZapFunctional';
import AnswerReviewFunctional from './ReviewsActions/AnswerReviewFunctional';
import ReviewAnswers from './ReviewsActions/ReviewAnswers';
import { useUpdateAnswersReviewState } from '../../context/UpdateAnswersContext';

function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

const NewReviews = ({ myReviews, profilePubkey, showSpinner }) => {
  const { newReview, empty, fetchReviews, setNewReview, updateState } =
    useNewReviewState();
  const { reviews, loading, lastCreatedAt, hasMore } = newReview;
  const { pubkey } = useAuth();
  const prevPubkey = usePrevious(pubkey);
  const [showAnswersReviewById, setShowAnswersById] = useState('');
  const [updateLike, setUpdateLike] = useState('FALSE');
  const zapButtonRef = useRef(null);
  const { updateAnswersMainPage } = useUpdateAnswersReviewState();
  const filteredReviews = reviews
    ?.filter((review) => review.app)
    .filter((review) => (myReviews ? review.pubkey === profilePubkey : true));
  const { activePage } = useParams();

  const handleScroll = useCallback(() => {
    if (hasMore && lastCreatedAt) {
      const scrollBottom = Math.abs(
        document.documentElement.scrollHeight -
          (window.innerHeight + document.documentElement.scrollTop)
      );
      updateState({ scrollPosition: window.scrollY });
      if (scrollBottom < 10 && !empty) {
        fetchReviews(lastCreatedAt, myReviews);
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
      fetchReviews(lastCreatedAt, myReviews);
    } else {
      fetchReviews(null, myReviews);
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
    <div className="pb-3">
      {myReviews ? (
        <h4>{profilePubkey === pubkey ? 'My reviews' : 'Reviews'}</h4>
      ) : (
        <h2>Reviews</h2>
      )}
      <ListGroup className="reviews-container">
        {reviews
          ?.filter((review) => review.app)
          .filter((review) =>
            myReviews ? review.pubkey === profilePubkey : true
          )
          ?.slice(activePage ? 0 : undefined, activePage ? 5 : undefined)
          .map((review) => {
            let count = cmn.getCountReview(review);
            let appProfile = review.app?.content
              ? cmn.convertContentToProfile([review.app])
              : {};
            let authorProfile = review.author?.content
              ? cmn.convertContentToProfile([review.author])
              : {};
            return (
              <ListGroupItem key={review.id} className="review-item">
                <div className="app-profile">
                  <Link to={review.app ? getUrl(review.app) : ''}>
                    {appProfile.pubkey ? (
                      <Profile
                        appLogo
                        small
                        removeLink
                        profile={{ profile: appProfile }}
                        pubkey={appProfile.pubkey}
                      />
                    ) : null}
                  </Link>
                </div>
                <Link to={cmn.generateLinkForReviewPage(review.id)}>
                  <div className="rating-content-container">
                    <p>{review.content}</p>
                    <Rating name="read-only" value={count} readOnly />
                  </div>
                </Link>

                <div className="d-flex justify-content-between">
                  {!myReviews ? (
                    <Profile
                      small
                      profile={{ profile: authorProfile }}
                      pubkey={review.pubkey}
                    />
                  ) : null}
                  <div className="container-actions-icon">
                    <ReviewLike
                      like={review.like}
                      countLikes={review.countLikes}
                      setUpdateLike={setUpdateLike}
                      review={review}
                    />
                    <ZapFunctional noteId={nip19.noteEncode(review.id)} />
                    <AnswerReviewFunctional review={review} mainPage />
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
        {loading && !empty && !activePage && <LoadingSpinner />}
        {loading && filteredReviews.length === 0 && activePage && (
          <LoadingSpinner />
        )}

        {filteredReviews.length === 0 && !loading ? (
          <span> Nothing yet.</span>
        ) : null}
      </ListGroup>
      {reviews.length > 0 && activePage ? (
        <Link to="/reviews">
          <button type="button" class="btn btn-primary show-more-button">
            More reviews
          </button>
        </Link>
      ) : null}
    </div>
  );
};

export default React.memo(NewReviews);
