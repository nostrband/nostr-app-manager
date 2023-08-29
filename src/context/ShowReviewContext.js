import { createContext, useContext, useState } from 'react';

const ReviewContext = createContext();

export const useReviewModal = () => {
  return useContext(ReviewContext);
};

export const ReviewModalProvider = ({ children }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);

  const value = {
    showReviewModal,
    setShowReviewModal,
  };

  return (
    <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
  );
};
