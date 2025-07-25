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
    status: null,
    timer: 0,
    bets: {
      red: {},
      black: {}
    },
    currentBets: {
      red: 0,
      black: 0
    },
    result: []
  },
  reducers: {
    setGameState: (state, action) => {
      if (!action.payload) return state;
      return {
        ...state,
        status: action.payload.status,
        timer: action.payload.timer,
        bets: action.payload.bets || state.bets,
        currentBets: action.payload.currentBets || state.currentBets,
        result: action.payload.result,
        lastResults: action.payload.lastResults || state.lastResults
      };
    },
    resetGameState: () => initialState,
    addBet: (state, action) => {
      const { betType, amount, userId } = action.payload;
      if (!state.bets[betType]) {
        state.bets[betType] = {};
      }
      state.bets[betType][userId] = { amount, matched: false };

    }
  },
});

export const { setGameState, resetGameState, addBet } = gameSlice.actions;
export default gameSlice.reducer;
