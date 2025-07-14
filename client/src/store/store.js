import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['socket/connected', 'socket/disconnected'],
          ignoredPaths: ['socket.instance'],
        },
      }),
});

export default store;

