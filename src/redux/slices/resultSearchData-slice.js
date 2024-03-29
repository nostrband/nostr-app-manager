import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cmn from '../../common';

export const fetchAppsBySearchQuery = createAsyncThunk(
  'searchResultData/fetchAppsBySearchQuery',
  async (searchValue) => {
    const ndk = await cmn.getNDK();
    if (searchValue.length > 0) {
      const filterApps = {
        kinds: [31990],
        search: `${searchValue} include:spam`,
      };
      let apps = await cmn.fetchAllEvents([cmn.startFetch(ndk, filterApps)]);
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
      return apps;
    }
  }
);

export const fetchReposBySearchQuery = createAsyncThunk(
  'searchResultData/fetchReposBySearchQuery',
  async (searchValue) => {
    const ndk = await cmn.getNDK();
    if (searchValue.length > 0) {
      const filterRepos = {
        kinds: [30117],
        search: `${searchValue} include:spam`,
      };
      let repos = await cmn.fetchAllEvents([cmn.startFetch(ndk, filterRepos)]);
      return cmn.addContributionCounts(repos);
    }
  }
);

const initialState = {
  apps: [],
  repositories: [],
  loadingApps: false,
  loadingRepos: false,
};

export const resultSearchSlice = createSlice({
  name: 'searchResultData',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.apps = [];
      state.repositories = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppsBySearchQuery.pending, (state) => {
        state.loadingApps = true;
      })
      .addCase(fetchAppsBySearchQuery.fulfilled, (state, { payload }) => {
        state.apps = payload;
        state.loadingApps = false;
      })
      .addCase(fetchAppsBySearchQuery.rejected, (state, action) => {
        state.loadingApps = false;
      })
      .addCase(fetchReposBySearchQuery.pending, (state) => {
        state.loadingRepos = true;
      })
      .addCase(fetchReposBySearchQuery.fulfilled, (state, { payload }) => {
        state.repositories = payload;
        state.loadingRepos = false;
      })
      .addCase(fetchReposBySearchQuery.rejected, (state, action) => {
        state.loadingRepos = false;
      });
  },
});

export const { clearSearchResults } = resultSearchSlice.actions;
