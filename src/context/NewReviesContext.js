import React, { createContext, useContext, useState } from 'react';

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

  return (
    <NewReviewContext.Provider
      value={{ newReview, setNewReview, empty, setEmpty }}
    >
      {children}
    </NewReviewContext.Provider>
  );
};
