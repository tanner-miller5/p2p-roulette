import reducer, { actions } from './userSlice';

describe('userSlice reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual({});
  });
});
