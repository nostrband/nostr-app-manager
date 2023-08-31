import { createContext, useContext, useState } from 'react';

const ReviewContext = createContext();

export const useReviewModal = () => {
  return useContext(ReviewContext);
};

export const ReviewModalProvider = ({ children }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState({ type: 'GET', pubkey: '' });

  const value = {
    showReviewModal,
    setShowReviewModal,
    setReviewAction,
    reviewAction,
  };

  return (
    <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
  );
};
