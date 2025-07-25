
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProfile } from '../../services/api';

// Async thunk for fetching profile
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await getProfile();
      return profile;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    data: null,
    loading: false,
    error: null,
    statistics: {
      totalGames: 0,
      gamesWon: 0,
      totalBets: 0,
      totalWinnings: 0
    }
  },
  reducers: {
    updateProfile: (state, action) => {
      state.data = action.data;
      state.error = action.error;
      state.statistics = action.statistics;
      state.balance = action.balance;
      state.username = action.username;
    },
    clearProfile: (state) => {
      state.data = null;
      state.error = null;
      state.statistics = {
        totalGames: 0,
        gamesWon: 0,
        totalBets: 0,
        totalWinnings: 0
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = {
          username: action.payload.username,
          balance: action.payload.balance
        };
        state.statistics = action.payload.statistics;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearProfile, updateProfile } = profileSlice.actions;
export default profileSlice.reducer;
