import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    username: '',
    balance: 0,
  },
  reducers: {
    updateBalance: (state, action) => {
      state.balance = action.payload;
    },
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    clearUserData: (state) => {
      state.username = '';
      state.balance = 0;
    },
  },
});

export const { updateBalance, setUsername, clearUserData
} = userSlice.actions;
export default userSlice.reducer;
