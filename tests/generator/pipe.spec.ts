import { describe, it, expect } from 'vitest';
import { pipe } from '../../src/generator/pipe.js';
import { from } from '../../src/generator/from.js';
import { map } from '../../src/operator/map.js';
import { filter } from '../../src/operator/filter.js';

describe('pipe', () => {
  it('should pipe a single operator', async () => {
    const result = pipe(
      from(1, 2, 3),
      (e) => map(e, (x: number) => x * 2),
      (e) => map(e, (x) => String(x)),
    );
    const output: string[] = [];
    for await (const v of result) {
      output.push(v);
    }
    expect(output).toEqual(['2', '4', '6']);
  });

  it('should pipe multiple operators', async () => {
    const result = pipe(
      from(1, 2, 3, 4),
      (e) => map(e, (x: number) => x * 2),
      (e) => filter(e, (x: number) => x > 4),
    );
    const output: number[] = [];
    for await (const v of result) {
      output.push(v);
    }
    expect(output).toEqual([6, 8]);
  });
});
