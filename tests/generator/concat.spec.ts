import { concat } from '../../src/generator/concat.js';
import { describe, it, expect } from 'vitest';

describe('concat', () => {
  async function* gen(arr: number[]) {
    for (const v of arr) {
      yield Promise.resolve(v);
    }
  }

  it('should concatenate multiple streams', async () => {
    const s1 = gen([1, 2]);
    const s2 = gen([3, 4]);
    const result = [];
    for await (const v of concat([s1, s2])) {
      result.push(v);
    }
    expect(result).toEqual([1, 2, 3, 4]);
  });

  it('should handle empty stream list', async () => {
    const result = [];
    for await (const v of concat([])) {
      result.push(v);
    }
    expect(result).toEqual([]);
  });
});
