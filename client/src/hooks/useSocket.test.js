import { renderHook } from '@testing-library/react';
import useSocket from './useSocket';

describe('useSocket', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useSocket());
    expect(result.current).toBeDefined();
  });
});
