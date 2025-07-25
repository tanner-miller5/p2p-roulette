import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  balance: 0,
  transactions: [],
  loading: false,
  error: null
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    updateBalance: (state, action) => {
      state.balance = action.payload;
    },
    addTransaction: (state, action) => {
      state.transactions.push(action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetWallet: () => initialState,
  },
});

export const {
  updateBalance,
  addTransaction,
  setLoading,
  setError,
  clearError,
  resetWallet
} = walletSlice.actions;

// Selectors
export const selectBalance = (state) => state.wallet.balance;
export const selectTransactions = (state) => state.wallet.transactions;
export const selectWalletLoading = (state) => state.wallet.loading;
export const selectWalletError = (state) => state.wallet.error;

export default walletSlice.reducer;