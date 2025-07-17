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
    result: null
  },
  reducers: {
    setGameState: (state, action) => {
      return {
        ...state,
        ...action.payload
      };
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
