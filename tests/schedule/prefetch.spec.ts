import { describe, it, expect } from 'vitest';
import { prefetch } from '../../src/schedule/prefetch.js';
import { PullStream } from '../../src/index.js';
import { delay } from 'es-toolkit';

describe('prefetch', () => {
  it('should prefetch items and yield them in order', async () => {
    const generator = async function* () {
      for (let i = 1; i <= 5; i++) {
        await delay(10);
        yield i;
      }
    };
    const result: number[] = [];
    for await (const v of prefetch(generator())) {
      result.push(v);
    }
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('should handle empty generator', async () => {
    const generator = async function* (): PullStream<number> {};
    const result: number[] = [];
    for await (const v of prefetch(generator())) {
      result.push(v);
    }
    expect(result).toEqual([]);
  });
});
