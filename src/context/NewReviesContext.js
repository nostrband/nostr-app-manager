import React, { createContext, useContext, useState } from 'react';
import * as cmn from '../common';

export const NewReviewContext = createContext();

export const useNewReviewState = () => {
  return useContext(NewReviewContext);
};

export const NewReviewStateProvider = ({ children }) => {
  const [newReview, setNewReview] = useState({
    reviews: [],
    apps: [],
    scrollPosition: 0,
    lastCreatedAt: null,
    hasMore: true,
    loading: false,
  });
  const [empty, setEmpty] = useState(false);

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
    updateState({ loading: true });
    const ndk = await cmn.getNDK();
    const filter = {
      kinds: [1985],
      '#l': ['review/app'],
      limit: 10,
      ...(created_at ? { until: created_at } : {}),
    };
    try {
      const response = await cmn.fetchAllEvents([cmn.startFetch(ndk, filter)]);
      const currentApps = newReview.reviews;

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
          const reviewsWithAllLikes = await cmn.associateLikesWithReviews(
            reviewsWithAuthorsAndApps
          );
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
    }
  };

  return (
    <NewReviewContext.Provider
      value={{
        newReview,
        setNewReview,
        empty,
        setEmpty,
        fetchReviews,
        updateState,
      }}
    >
      {children}
    </NewReviewContext.Provider>
  );
};
