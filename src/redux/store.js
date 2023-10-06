import { configureStore } from '@reduxjs/toolkit';
import { mainDataSlice } from './slices/mainData-slice';

export const store = configureStore({
  reducer: {
    [mainDataSlice.name]: mainDataSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([]),
});
