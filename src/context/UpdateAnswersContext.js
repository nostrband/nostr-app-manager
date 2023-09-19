import React, { createContext, useContext, useState } from 'react';

const UpdateAnswersReviewContext = createContext();

export function useUpdateAnswersReviewState() {
  return useContext(UpdateAnswersReviewContext);
}

export function UpdateAnswersReviewProvider({ children }) {
  const [updateAnswersMainPage, setUpdateAnswersMainPage] = useState();
  const [updateAnswers, setUpdateAnswers] = useState();

  return (
    <UpdateAnswersReviewContext.Provider
      value={{
        updateAnswers,
        setUpdateAnswers,
        setUpdateAnswersMainPage,
        updateAnswersMainPage,
      }}
    >
      {children}
    </UpdateAnswersReviewContext.Provider>
  );
}
