import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
      user: userReducer,
      // Add reducers here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredActions: ['socket/connected', 'socket/disconnected'],
        ignoredPaths: ['socket.instance'],
      },
    }),
});
