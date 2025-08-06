import { describe, it, expect } from 'vitest';
import { bufferCount } from '../../src/operator/buffer-count.js';
import { from } from '../../src/generator/from.js';

describe('bufferCount', () => {
  it('should group items by the specified count', async () => {
    const buffered = bufferCount(from(1, 2, 3, 4, 5, 6, 7), 3);
    const results: number[][] = [];
    for await (const batch of buffered) {
      results.push(batch);
    }
    expect(results).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
  });

  it('should output nothing for an empty stream', async () => {
    const buffered = bufferCount<number>(from(), 2);
    const results: number[][] = [];
    for await (const batch of buffered) {
      results.push(batch);
    }
    expect(results).toEqual([]);
  });

  it('항목이 정확히 묶음 크기의 배수일 때 남는 항목 없이 처리해야 함', async () => {
    const generator = async function* (): AsyncGenerator<string, void, void> {
      await Promise.resolve();
      yield 'a';
      yield 'b';
      yield 'c';
      yield 'd';
    };

    const bufferedGenerator = bufferCount(generator(), 2);

    const results = [];
    for await (const batch of bufferedGenerator) {
      results.push(batch);
    }

    expect(results).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });
});
