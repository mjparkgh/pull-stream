import { describe, it, expect } from 'vitest';
import { filter } from '../../src/index.js';

describe('filter', () => {
  it('조건에 맞는 값만 통과시켜야 함', async () => {
    const generator = async function* (): AsyncGenerator<number, void, void> {
      await Promise.resolve(); // 비동기 작업 시뮬레이션
      yield 1;
      yield 2;
      yield 3;
      yield 4;
      yield 5;
    };

    const predicate = (x: number) => x % 2 === 0; // 짝수만 필터링

    const filteredGenerator = filter(generator(), predicate);

    const results = [];
    for await (const value of filteredGenerator) {
      results.push(value);
    }

    expect(results).toEqual([2, 4]);
  });

  it('비동기 조건 함수도 처리할 수 있어야 함', async () => {
    const generator = async function* (): AsyncGenerator<number, void, void> {
      await Promise.resolve();
      yield 10;
      yield 15;
      yield 20;
      yield 25;
    };

    const asyncPredicate = async (x: number) => {
      await Promise.resolve(); // 비동기 작업 시뮬레이션
      return x > 15; // 15보다 큰 숫자만 반환
    };

    const filteredGenerator = filter(generator(), asyncPredicate);

    const results = [];
    for await (const value of filteredGenerator) {
      results.push(value);
    }

    expect(results).toEqual([20, 25]);
  });
});
