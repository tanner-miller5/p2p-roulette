import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: 'waiting',
  timer: 30,
  result: null,
  bets: {
    red: {},
    black: {}
  },
};

const gameSlice = createSlice({
  name: 'game',
  initialState: {
    status: 'waiting',
    timer: 30,
    bets: {
      red: {},
      black: {}
    },
    result: null
  },
  reducers: {
    setGameState: (state, action) => {
      const newState = { ...action.payload };
      if (newState.bets) {
        newState.bets = {
          red: newState.bets.red || {},
          black: newState.bets.black || {}
        };
      }
      return { ...state, ...newState };
    },
    resetGame: () => initialState,
    addBet: (state, action) => {
      const { betType, amount, userId } = action.payload;
      if (!state.bets[betType]) {
        state.bets[betType] = {};
      }
      state.bets[betType][userId] = { amount, matched: false };

    }
  },
});

export const { setGameState, resetGame, addBet } = gameSlice.actions;
export default gameSlice.reducer;
