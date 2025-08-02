import { describe, it, expect } from 'vitest';
import { mergeMap } from '../../src/index.js';

describe('mergeMap', () => {
  it('단일 스트림을 변환해야 함', async () => {
    const generator = async function* (): AsyncGenerator<number, void, void> {
      await Promise.resolve();
      yield 1;
      yield 2;
      yield 3;
    };

    const mapper = (x: number) => x * 10;

    const mergedStream = mergeMap(generator(), mapper);

    const results = [];
    for await (const value of mergedStream) {
      results.push(value);
    }

    expect(results.sort()).toEqual([10, 20, 30]);
  });

  it('동시성 제한을 존중해야 함', async () => {
    let activeCount = 0;
    let maxActive = 0;

    // 실행 중인 작업의 개수를 추적하는 비동기 매퍼 함수
    const asyncMapper = async (x: number) => {
      activeCount++;
      maxActive = Math.max(maxActive, activeCount);

      await new Promise((resolve) => setTimeout(resolve, 20));

      activeCount--;
      return x * 2;
    };

    const items = Array.from({ length: 10 }, (_, i) => i + 1);

    const generator = async function* () {
      await Promise.resolve();
      for (const item of items) {
        yield item;
      }
    };

    // 동시성을 3으로 제한
    const mergedStream = mergeMap(generator(), asyncMapper, 3);

    const results = [];
    for await (const value of mergedStream) {
      results.push(value);
    }

    expect(results.sort((a, b) => a - b)).toEqual([
      2, 4, 6, 8, 10, 12, 14, 16, 18, 20,
    ]);
    expect(maxActive).toBeLessThanOrEqual(3); // 동시성이 3을 초과하지 않아야 함
  });

  it('에러 처리를 올바르게 해야 함', async () => {
    const generator = async function* (): AsyncGenerator<number, void, void> {
      await Promise.resolve();
      yield 1;
      yield 2;
      yield 3;
    };

    const errorMapper = async (x: number) => {
      await Promise.resolve();
      if (x === 2) {
        throw new Error('테스트 에러');
      }
      return x * 10;
    };

    const mergedStream = mergeMap(generator(), errorMapper);

    await expect(async () => {
      const results = [];
      for await (const value of mergedStream) {
        results.push(value);
      }
    }).rejects.toThrow('테스트 에러');
  });
});
