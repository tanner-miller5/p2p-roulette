import { renderHook } from '@testing-library/react';
import useGameState from './useGameState';

describe('useGameState', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useGameState());
    expect(result.current).toBeDefined();
  });
});
