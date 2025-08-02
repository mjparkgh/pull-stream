import { describe, it, expect } from 'vitest';
import { from } from '../../src/generator/from.js';

describe('from', () => {
  it('should create a pull stream from an array', async () => {
    const result: number[] = [];
    for await (const v of from(1, 2, 3)) {
      result.push(v);
    }
    expect(result).toEqual([1, 2, 3]);
  });

  it('should handle empty array', async () => {
    const result: number[] = [];
    for await (const v of from<number>()) {
      result.push(v);
    }
    expect(result).toEqual([]);
  });
});
