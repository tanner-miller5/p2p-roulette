import reducer, { actions } from './gameSlice';

describe('gameSlice reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual({});
  });
});
