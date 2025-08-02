import { describe, it, expect } from 'vitest';
import { bufferCount } from '../../src/index.js';

describe('bufferCount', () => {
  it('지정된 개수만큼 항목을 묶어야 함', async () => {
    const generator = async function* (): AsyncGenerator<number, void, void> {
      await Promise.resolve();
      for (let i = 1; i <= 7; i++) {
        yield i;
      }
    };

    const bufferedGenerator = bufferCount(generator(), 3);

    const results = [];
    for await (const batch of bufferedGenerator) {
      results.push(batch);
    }

    expect(results).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
  });

  it('빈 스트림에 대해 아무것도 출력하지 않아야 함', async () => {
    const emptyGenerator = async function* (): AsyncGenerator<
      number,
      void,
      void
    > {
      await Promise.resolve();
      yield* [];
    };

    const bufferedGenerator = bufferCount(emptyGenerator(), 2);

    const results = [];
    for await (const batch of bufferedGenerator) {
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
