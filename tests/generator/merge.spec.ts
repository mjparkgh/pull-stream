import { describe, it, expect } from 'vitest';
import { merge } from '../../src/generator/merge.js';
import { delay } from 'es-toolkit';

describe('merge', () => {
  it('단일 스트림을 그대로 출력해야 함', async () => {
    const generator = async function* (): AsyncGenerator<number, void, void> {
      await delay(Math.random() * 30);
      yield 1;
      await delay(Math.random() * 30);
      yield 2;
      await delay(Math.random() * 30);
      yield 3;
    };

    const mergedStream = merge([generator()]);

    const results = [];
    for await (const value of mergedStream) {
      results.push(value);
    }

    expect(results.sort()).toEqual([1, 2, 3]);
  });

  it('여러 스트림을 병합해야 함', async () => {
    const generator1 = async function* (): AsyncGenerator<number, void, void> {
      await delay(10);
      yield 1;
      await delay(20);
      yield 2;
    };

    const generator2 = async function* (): AsyncGenerator<number, void, void> {
      await delay(30);
      yield 3;
      await delay(50);
      yield 4;
    };

    const generator3 = async function* (): AsyncGenerator<number, void, void> {
      await delay(40);
      yield 5;
      await delay(10);
      yield 6;
    };

    const mergedStream = merge([generator1(), generator2(), generator3()]);

    const results = [];
    for await (const value of mergedStream) {
      results.push(value);
    }

    expect(results.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('동시성 제한을 존중해야 함', async () => {
    let activeCount = 0;
    let maxActive = 0;

    const generators = Array.from({ length: 10 }, (_, i) => {
      return async function* () {
        activeCount++;
        maxActive = Math.max(maxActive, activeCount);

        // 랜덤 딜레이 (10-40ms)
        await delay(10 + Math.random() * 30);
        yield i + 1;

        // 다른 랜덤 딜레이 (10-40ms)
        await delay(10 + Math.random() * 30);
        activeCount--;
      };
    });

    // 동시성을 3으로 제한
    const mergedStream = merge(
      generators.map((g) => g()),
      3,
    );

    const results = [];
    for await (const value of mergedStream) {
      results.push(value);
    }

    expect(results.sort((a, b) => a - b)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(maxActive).toBeLessThanOrEqual(3); // 동시성이 3을 초과하지 않아야 함
  });

  it('비어있는 스트림 리스트를 처리할 수 있어야 함', async () => {
    const mergedStream = merge([]);

    const results = [];
    for await (const value of mergedStream) {
      results.push(value);
    }

    expect(results).toEqual([]);
  });

  it('일부 스트림이 에러를 발생시키면 전체 스트림이 에러를 전파해야 함', async () => {
    const generator1 = async function* () {
      await delay(Math.random() * 40);
      yield 1;
      await delay(Math.random() * 40);
      yield 2;
    };

    const generator2 = async function* () {
      await delay(Math.random() * 40);
      yield 3;
      await delay(Math.random() * 40);
      throw new Error('테스트 에러');
    };

    const mergedStream = merge([generator1(), generator2()]);

    await expect(async () => {
      const results = [];
      for await (const value of mergedStream) {
        results.push(value);
      }
    }).rejects.toThrow('테스트 에러');
  });
});
