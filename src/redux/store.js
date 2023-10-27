import { configureStore } from '@reduxjs/toolkit';
import { mainDataSlice } from './slices/mainData-slice';
import { resultSearchSlice } from './slices/resultSearchData-slice';

export const store = configureStore({
  reducer: {
    [mainDataSlice.name]: mainDataSlice.reducer,
    [resultSearchSlice.name]: resultSearchSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([]),
});
