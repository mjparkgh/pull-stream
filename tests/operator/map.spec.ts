import { describe, it, expect } from 'vitest';
import { map } from '../../src/index.js';

describe('map', () => {
  it('should convert values using the provided function', async () => {
    const generator = async function* (): AsyncGenerator<number, void, void> {
      await Promise.resolve(); // Simulate async operation
      yield 1;
      yield 2;
      yield 3;
    };

    const mapFn = (x: number) => x * 2;

    const mappedGenerator = map(generator(), mapFn);

    const results = [];
    for await (const value of mappedGenerator) {
      results.push(value);
    }

    expect(results).toEqual([2, 4, 6]);
  });
});
