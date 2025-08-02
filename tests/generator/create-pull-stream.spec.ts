import { describe, it, expect } from 'vitest';
import { createPullStream } from '../../src/index.js';

describe('createPullStream', () => {
  it('콜백을 사용하여 비동기 제너레이터를 생성해야 함', async () => {
    // 1부터 5까지 생성하는 콜백
    const callback = (input: number | null) => {
      if (input === null) {
        // 첫 번째 호출
        return { next: 1, data: 1 };
      }

      const nextValue = input + 1;
      if (nextValue < 5) {
        return { next: nextValue, data: nextValue };
      } else {
        // 스트림 종료
        return { next: null, data: 5 };
      }
    };

    const generator = createPullStream(callback);

    const results = [];
    for await (const value of generator) {
      results.push(value);
    }

    expect(results).toEqual([1, 2, 3, 4, 5]);
  });

  it('비동기 콜백을 지원해야 함', async () => {
    // 비동기 콜백으로 스트림 생성
    const asyncCallback = async (input: number | null) => {
      await new Promise((resolve) => setTimeout(resolve, 10)); // 비동기 지연

      if (input === null) {
        return { next: 10, data: 'start' };
      }

      if (input === 10) {
        return { next: 20, data: 'middle' };
      }

      if (input === 20) {
        return { next: null, data: 'end' };
      }

      return { next: null, data: 'unexpected' }; // 여기까지 오면 안됨
    };

    const generator = createPullStream(asyncCallback);

    const results = [];
    for await (const value of generator) {
      results.push(value);
    }

    expect(results).toEqual(['start', 'middle', 'end']);
  });

  it('빈 스트림도 올바르게 처리해야 함', async () => {
    // 즉시 종료되는 스트림
    const emptyCallback = () => {
      return { next: null, data: 'single value' };
    };

    const generator = createPullStream(emptyCallback);

    const results = [];
    for await (const value of generator) {
      results.push(value);
    }

    expect(results).toEqual(['single value']);
  });
});
