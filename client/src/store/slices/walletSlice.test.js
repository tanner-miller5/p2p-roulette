import reducer, { actions } from './walletSlice';

describe('walletSlice reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual({});
  });
});
