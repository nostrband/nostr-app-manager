import React, { createContext, useContext, useState } from 'react';

export const AppStateContext = createContext();

export const useAppState = () => {
  return useContext(AppStateContext);
};

export const AppStateProvider = ({ children }) => {
  const [appListState, setAppListState] = useState({
    allApps: [],
    scrollPosition: 0,
    lastCreatedAt: null,
    hasMore: true,
    loading: false,
    followedPubkeys: [],
    appCountsState: 0,
    appAddrs: [],
  });

  const [empty, setEmpty] = useState(false);

  return (
    <AppStateContext.Provider
      value={{ appListState, setAppListState, empty, setEmpty }}
    >
      {children}
    </AppStateContext.Provider>
  );
};
