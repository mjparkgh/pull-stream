import { describe, it, expect } from 'vitest';
import { map, eachMap, inplaceEachMap } from '../../src/operator/map.js';
import { from } from '../../src/generator/from.js';

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

  it('should map values using async function', async () => {
    const mapped = map(from(1, 2, 3), (x: number) => x * 3);
    const results: number[] = [];
    for await (const value of mapped) {
      results.push(value);
    }
    expect(results).toEqual([3, 6, 9]);
  });
});

describe('eachMap', () => {
  it('should map each element in arrays', async () => {
    const mapped = eachMap(from([1, 2], [3, 4]), (x: number) => x.toString());
    const results: string[][] = [];
    for await (const arr of mapped) {
      results.push(arr);
    }
    expect(results).toEqual([
      ['1', '2'],
      ['3', '4'],
    ]);
  });
});

describe('inplaceEachMap', () => {
  it('should map each element in arrays in-place', async () => {
    const mapped = inplaceEachMap(from([1, 2], [3, 4]), (x: number) => x * 10);
    const results: number[][] = [];
    for await (const arr of mapped) {
      results.push(arr);
    }
    expect(results).toEqual([
      [10, 20],
      [30, 40],
    ]);
  });
});
