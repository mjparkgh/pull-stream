import { describe, it, expect, vi } from 'vitest';
import { tap, eachTap } from '../../src/operator/tap.js';
import { from } from '../../src/generator/from.js';

describe('tap', () => {
  it('should call sideEffect for each value and yield original values', async () => {
    const sideEffect = vi.fn();
    const numbers = from(1, 2, 3);
    const tapped = tap(numbers, sideEffect);
    const results = [];
    for await (const value of tapped) {
      results.push(value);
    }
    expect(results).toEqual([1, 2, 3]);
    expect(sideEffect).toHaveBeenCalledTimes(3);
    expect(sideEffect).toHaveBeenCalledWith(1);
    expect(sideEffect).toHaveBeenCalledWith(2);
    expect(sideEffect).toHaveBeenCalledWith(3);
  });
});

describe('eachTap', () => {
  it('should call sideEffect for each element in arrays and yield original arrays', async () => {
    const sideEffect = vi.fn();
    const arrays = from([1, 2], [3, 4]);
    const tapped = eachTap(arrays, sideEffect);
    const results = [];
    for await (const arr of tapped) {
      results.push(arr);
    }
    expect(results).toEqual([
      [1, 2],
      [3, 4],
    ]);
    expect(sideEffect).toHaveBeenCalledTimes(4);
    expect(sideEffect).toHaveBeenCalledWith(1);
    expect(sideEffect).toHaveBeenCalledWith(2);
    expect(sideEffect).toHaveBeenCalledWith(3);
    expect(sideEffect).toHaveBeenCalledWith(4);
  });
});
