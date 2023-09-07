import React, { useCallback, useEffect, useState } from 'react';
import * as cmn from '../../common';
import { useNewReviewState } from '../../context/NewReviesContext';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import Profile from '../../elements/Profile';
import { Link } from 'react-router-dom';
import { Rating } from '@mui/material';
import LoadingSpinner from '../../elements/LoadingSpinner';

const NewReviews = () => {
  const { newReview, setNewReview, empty, setEmpty } = useNewReviewState();
  const { reviews, loading, apps, lastCreatedAt, hasMore } = newReview;
  const updateState = (changes) => {
    setNewReview((prevState) => ({ ...prevState, ...changes }));
  };

  const getAppTagsFromReview = (reviews) => {
    let pubkeys = [];
    let identifiers = [];

    reviews.forEach((review) => {
      const appTag = review.tags.find(
        (tag) => tag[0] === 'a' && tag[1].startsWith('31990:')
      );
      if (appTag) {
        const splitTag = appTag[1].split(':');
        pubkeys.push(splitTag[1]);
        identifiers.push(splitTag[2]);
      }
    });

    return { pubkeys, identifiers };
  };

  const fetchApps = async (pubkeys, identifiers) => {
    const ndk = await cmn.getNDK();
    try {
      const filter = {
        kinds: [31990],
        authors: pubkeys,
        '#d': identifiers,
      };
      const response = await cmn.fetchAllEvents([cmn.startFetch(ndk, filter)]);
      return response;
    } catch (error) {
      return console.log(error);
    }
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
          updateState({
            reviews: [...currentApps, ...filteredReviews],
            lastCreatedAt:
              filteredReviews[filteredReviews.length - 1].created_at,
          });

          const { pubkeys, identifiers } =
            getAppTagsFromReview(filteredReviews);
          const newApps = await fetchApps(pubkeys, identifiers);
          updateState({ apps: [...apps, ...newApps] });
          const missingAppPubkeys = newApps
            .filter((app) => !app.content)
            .map((app) => app.pubkey);
          if (missingAppPubkeys.length > 0) {
            const filterForMissingContent = {
              kinds: [0],
              authors: missingAppPubkeys,
            };
            const authorsContentResponse = await cmn.fetchAllEvents([
              cmn.startFetch(ndk, filterForMissingContent),
            ]);
            const updatedApps = newApps.map((app) => {
              if (!app.content) {
                const matchedAuthor = authorsContentResponse.find(
                  (author) => author.pubkey === app.pubkey
                );
                if (matchedAuthor && matchedAuthor.content) {
                  app.content = matchedAuthor.content;
                }
              }
              return app;
            });
            updateState({ apps: [...apps, ...updatedApps] });
          }
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

  return (
    <>
      <ListGroup className="reviews-container">
        {reviews?.map((review) => {
          const profile = review?.author?.content
            ? JSON.parse(review?.author?.content)
            : {};

          const appTag = review.tags?.find(
            (tag) => tag[0] === 'a' && tag[1]?.startsWith('31990:')
          );

          let app;
          if (appTag && appTag.length > 1) {
            const splitTag = appTag[1].split(':');
            if (splitTag.length > 1) {
              const appPubkey = splitTag[1];
              app = apps.find((app) => app.pubkey === appPubkey);
            }
          }
          let count = cmn.getCountReview(review);
          const convertApp = app?.content
            ? cmn.convertContentToProfile([app])
            : {};

          return (
            <ListGroupItem key={review.pubkey} className="review-item darked">
              {convertApp.pubkey ? (
                <Profile
                  removeLink
                  profile={{ profile: convertApp }}
                  pubkey={convertApp.pubkey}
                />
              ) : null}
              <div className="d-flex justify-content-between mx-1 mt-2">
                <p>{review.content}</p>
                <Rating name="read-only" value={count} readOnly />
              </div>
              <Profile
                removeLink
                small
                profile={{ profile }}
                pubkey={review.pubkey}
              />
            </ListGroupItem>
          );
        })}
        {loading && !empty && <LoadingSpinner />}
      </ListGroup>
    </>
  );
};

export default React.memo(NewReviews);
