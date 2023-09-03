import React, { createContext, useState } from 'react';

const NewAppsContext = createContext();

const NewAppsProvider = ({ children }) => {
  const [appsList, setAppsList] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);

  return (
    <NewAppsContext.Provider
      value={{ appsList, setAppsList, scrollPosition, setScrollPosition }}
    >
      {children}
    </NewAppsContext.Provider>
  );
};

export { NewAppsContext, NewAppsProvider };
