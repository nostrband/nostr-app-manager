import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  apps: [],
  repositoriesData: {
    repos: [],
    last_created_at: null,
    empty: false,
  },
  searchResultApps: [],
};

export const mainDataSlice = createSlice({
  name: 'mainData',
  initialState,
  reducers: {
    setApps(state, { payload }) {
      state.apps = payload;
    },
    setRepos(state, { payload }) {
      state.repositoriesData.repos = [
        ...state?.repositoriesData?.repos,
        ...payload.repos,
      ];
      state.repositoriesData.last_created_at = payload.last_created_at;
    },
    setEmpty(state) {
      state.repositoriesData.empty = true;
    },
  },
});

export const mainDataActions = mainDataSlice.actions;
