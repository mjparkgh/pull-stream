import { describe, it, expect } from 'vitest';
import { flat } from '../../src/operator/flat.js';

describe('flat', () => {
  it('should flatten nested arrays', async () => {
    const generator = async function* () {
      yield Promise.resolve([1, 2]);
      yield Promise.resolve([3, 4]);
      yield Promise.resolve([5]);
    };
    const result: number[] = [];
    for await (const v of flat(generator())) {
      result.push(v);
    }
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('should handle empty arrays', async () => {
    const generator = async function* () {
      yield Promise.resolve([]);
      yield Promise.resolve([1]);
      yield Promise.resolve([]);
    };
    const result: number[] = [];
    for await (const v of flat(generator())) {
      result.push(v);
    }
    expect(result).toEqual([1]);
  });
});
