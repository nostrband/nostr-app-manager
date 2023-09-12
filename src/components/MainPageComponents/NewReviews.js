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
  const { newReview, setNewReview, empty, setEmpty } = useNewReviewState();
  const { reviews, loading, apps, lastCreatedAt, hasMore } = newReview;
  const loginPubkey = cmn.getLoginPubkey() ? cmn.getLoginPubkey() : '';

  const updateState = (changes) => {
    setNewReview((prevState) => ({ ...prevState, ...changes }));
  };

  const extractPubkey = (tags) => {
    const pubkeyTag = tags.find(
      (tag) => tag[0] === 'a' && tag[1].startsWith('31990:')
    );
    if (pubkeyTag) {
      return pubkeyTag[1].split(':')[1];
    }
    return null;
  };

  const extractIdentifier = (tags) => {
    const identifierTag = tags.find(
      (tag) => tag[0] === 'a' && tag[1].startsWith('31990:')
    );
    if (identifierTag) {
      return identifierTag[1].split(':')[2];
    }
    return '';
  };

  const associateAuthorsWithReviews = (reviews, authors) => {
    return reviews.map((review) => {
      const author = authors.find((author) => author.pubkey === review.pubkey);
      return { ...review, author: author || null };
    });
  };

  const associateAppsWithReviews = (reviews, apps) => {
    return reviews.map((review) => {
      const reviewPTagValue = extractPubkey(review.tags);
      const reviewIdentifier = extractIdentifier(review.tags);

      const app = apps.find(
        (app) =>
          app.pubkey === reviewPTagValue &&
          app.tags &&
          app.tags.find((tag) => tag[0] === 'd' && tag[1] === reviewIdentifier)
      );

      return { ...review, app: app || null };
    });
  };

  const fetchReviews = async (created_at) => {
    const ndk = await cmn.getNDK();
    updateState({ loading: true });

    const filter = {
      kinds: [1985],
      '#l': ['review/app'],
      limit: 10,
      ...(created_at ? { until: created_at } : {}),
    };

    try {
      const response = await cmn.fetchAllEvents([cmn.startFetch(ndk, filter)]);
      const currentApps = reviews;

      if (response.length > 0) {
        const filteredReviews = response.filter(
          (newApp) =>
            !currentApps.some((existingApp) => existingApp.id === newApp.id)
        );

        if (filteredReviews.length === 0) {
          setEmpty(true);
        } else {
          const extractedPubkeys = filteredReviews
            .map((review) => extractPubkey(review.tags))
            .filter(Boolean);

          const pubkeysReview = filteredReviews.map((review) => review.pubkey);

          const extractedIdentifiers = filteredReviews
            .map((review) => extractIdentifier(review.tags))
            .filter(Boolean);
          // Fetch authors
          const filterForGetAuthorsReview = {
            kinds: [0],
            authors: pubkeysReview,
          };
          const authors = await cmn.fetchAllEvents([
            cmn.startFetch(ndk, filterForGetAuthorsReview),
          ]);
          // Fetch apps
          const filterForGetApps = {
            kinds: [31990],
            authors: extractedPubkeys,
            '#d': extractedIdentifiers,
          };
          const apps = await cmn.fetchAllEvents([
            cmn.startFetch(ndk, filterForGetApps),
          ]);
          const appsWithEmptyContent = apps.filter((app) => !app.content);
          if (appsWithEmptyContent.length) {
            const pubkeysForEmptyContentApps = appsWithEmptyContent.map(
              (app) => app.pubkey
            );
            const filterForAuthorsOfEmptyContentApps = {
              kinds: [0],
              authors: pubkeysForEmptyContentApps,
            };
            const authorsOfEmptyContentApps = await cmn.fetchAllEvents([
              cmn.startFetch(ndk, filterForAuthorsOfEmptyContentApps),
            ]);
            authorsOfEmptyContentApps.forEach((updatedApp) => {
              const index = apps.findIndex(
                (app) => app.pubkey === updatedApp.pubkey
              );
              if (index !== -1) {
                apps[index].content = updatedApp.content;
              }
            });
          }
          const reviewsWithAuthors = associateAuthorsWithReviews(
            filteredReviews,
            authors
          );
          const reviewsWithAuthorsAndApps = associateAppsWithReviews(
            reviewsWithAuthors,
            apps
          );
          // fetch likes
          const allReviewIds = reviewsWithAuthorsAndApps.map((r) => r.id);
          const resultLikes = await cmn.fetchLikes(allReviewIds, loginPubkey);
          const reviewsWithLikes = reviewsWithAuthorsAndApps.map((review) => {
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
          updateState({
            reviews: [...currentApps, ...reviewsWithAllLikes],
            lastCreatedAt:
              reviewsWithAllLikes[reviewsWithAllLikes.length - 1].created_at,
          });
        }
      } else {
        updateState({ hasMore: false });
      }
    } catch (error) {
      console.error(error);
    } finally {
      updateState({ loading: false });
    }
  };

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
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, loading, lastCreatedAt]);

  const getUrl = (h) => cmn.formatAppUrl(cmn.getNaddr(h));

  console.log(reviews, 'REVIEWS');
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
                      lastCreatedAt={lastCreatedAt}
                      fetchReviews={fetchReviews}
                      review={review}
                    />
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
