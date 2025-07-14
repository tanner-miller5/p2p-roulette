import reducer, { actions } from './store';

describe('store reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual({});
  });
});
