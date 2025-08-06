import { describe, it, expect } from 'vitest';
import { mapError } from '../../src/operator/map-error.js';

describe('mapError', () => {
  it('should yield values and map error to a value', async () => {
    async function* errorStream() {
      yield Promise.resolve(1);
      throw new Error('fail');
    }

    const result = mapError(errorStream(), (e) => {
      if (e instanceof Error) return -1;
      return 0;
    });

    const output: number[] = [];
    for await (const v of result) {
      output.push(v);
    }
    expect(output).toEqual([1, -1]);
  });

  it('should yield all values if no error occurs', async () => {
    async function* normalStream() {
      yield Promise.resolve(1);
      yield Promise.resolve(2);
    }

    const result = mapError(normalStream(), () => -1);

    const output: number[] = [];
    for await (const v of result) {
      output.push(v);
    }
    expect(output).toEqual([1, 2]);
  });
});
