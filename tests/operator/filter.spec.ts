import { describe, it, expect } from 'vitest';
import { filter, eachFilter } from '../../src/operator/filter.js';
import { from } from '../../src/generator/from.js';

describe('filter', () => {
  it('should only pass values that match the predicate', async () => {
    const predicate = (x: number) => x % 2 === 0;
    const filtered = filter(from(1, 2, 3, 4, 5), predicate);
    const results: number[] = [];
    for await (const value of filtered) {
      results.push(value);
    }
    expect(results).toEqual([2, 4]);
  });

  it('should handle async predicate functions', async () => {
    const asyncPredicate = async (x: number) => {
      await Promise.resolve();
      return x > 15;
    };
    const filtered = filter(from(10, 15, 20, 25), asyncPredicate);
    const results: number[] = [];
    for await (const value of filtered) {
      results.push(value);
    }
    expect(results).toEqual([20, 25]);
  });

  it('should filter each array from the input stream', async () => {
    const arrays = from([1, 2, 3], [4, 5, 6]);
    const filtered = eachFilter(arrays, (x) => x % 2 === 0);
    const results: number[][] = [];
    for await (const arr of filtered) {
      results.push(arr);
    }
    expect(results).toEqual([[2], [4, 6]]);
  });
});
