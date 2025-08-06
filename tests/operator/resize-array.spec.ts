import { describe, it, expect } from 'vitest';
import { from } from '../../src/generator/from.js';
import { resizeArray } from '../../src/operator/resize-array.js';

describe('bufferCount', () => {
  it('should adjust buffer size and split incoming arrays into chunks', async () => {
    const batches = from([1, 2], [3, 4, 5], [6]);
    const resized = resizeArray(batches, 3);
    const results: number[][] = [];
    for await (const batch of resized) {
      results.push(batch);
    }
    expect(results).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });
});
