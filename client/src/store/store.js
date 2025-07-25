import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import userReducer from './slices/userSlice';
import profileReducer from './slices/profileSlice';
import walletReducer from './slices/walletSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    user: userReducer,
    profile: profileReducer,
    wallet: walletReducer
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

