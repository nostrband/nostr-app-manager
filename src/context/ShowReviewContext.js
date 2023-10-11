import { createContext, useContext, useState } from 'react';

const ReviewContext = createContext();

export const useReviewModal = () => {
  return useContext(ReviewContext);
};

export const ReviewModalProvider = ({ children }) => {
  const [reviewAction, setReviewAction] = useState({ type: 'GET', pubkey: '' });

  const value = {
    setReviewAction,
    reviewAction,
  };

  return (
    <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
  );
};
