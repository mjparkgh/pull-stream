import { describe, it, expect } from 'vitest';
import { pushToPullStream } from '../../src/generator/push-to-pull-stream.js';

describe('pushToPullStream', () => {
  it('푸시 기반 API를 풀 기반 스트림으로 변환해야 함', async () => {
    // 이벤트 에미터 시뮬레이션
    const simulatePushSource = (
      callback: (error: unknown, data: number | null, isDone?: boolean) => void,
    ) => {
      setTimeout(() => callback(null, 1), 10);
      setTimeout(() => callback(null, 2), 20);
      setTimeout(() => callback(null, 3), 30);
      setTimeout(() => callback(null, null, true), 40); // 완료 신호
    };

    const stream = pushToPullStream(simulatePushSource);

    const results = [];
    for await (const item of stream) {
      results.push(item);
    }

    expect(results).toEqual([1, 2, 3]);
  });

  it('에러가 발생하면 예외를 던져야 함', async () => {
    const testError = new Error('테스트 에러');

    const simulateErrorSource = (
      callback: (error: unknown, data: number | null, isDone?: boolean) => void,
    ) => {
      setTimeout(() => callback(null, 1), 10);
      setTimeout(() => callback(testError, null), 20); // 에러 발생
    };

    const stream = pushToPullStream(simulateErrorSource);

    try {
      const results = [];
      for await (const item of stream) {
        results.push(item);
      }
      // 이 코드는 실행되지 않아야 함
      expect(false).toBeTruthy();
    } catch (error) {
      expect(error).toBe(testError);
    }
  });

  it('useStack=true 옵션을 사용하면 LIFO 순서로 데이터를 반환해야 함', async () => {
    const simulatePushSource = (
      callback: (error: unknown, data: string | null, isDone?: boolean) => void,
    ) => {
      callback(null, 'first');
      callback(null, 'second');
      callback(null, 'third');
      callback(null, null, true); // 완료 신호
    };

    const stream = pushToPullStream(simulatePushSource, true); // useStack = true

    const results = [];
    for await (const item of stream) {
      results.push(item);
    }

    // LIFO 순서로 반환되므로 역순이어야 함
    expect(results).toEqual(['third', 'second', 'first']);
  });
});
