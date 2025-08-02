import { Promisable } from '../types/promisable.js';
import { PullStream, PullStreamResult } from '../types/pull-stream.js';

/**
 * 여러 스트림을 병합하고 각 항목에 변환 함수를 적용하는 연산자
 *
 * @template T - 입력 스트림의 데이터 타입
 * @template R - 출력 스트림의 데이터 타입
 * @param {PullStream<T> | PullStream<T>[]} stream - 단일 또는 여러 입력 스트림
 * @param {function} mapper - 각 항목을 변환하는 함수
 * @param {number} [count=10] - 동시에 처리할 최대 항목 수
 * @returns {PullStream<R>} 변환된 항목들의 병합된 스트림
 *
 * @example
 * // 여러 스트림을 병합하고 변환
 * const combinedStream = mergeMap(
 *   [stream1, stream2, stream3],
 *   async item => {
 *     const result = await processItem(item);
 *     return result;
 *   },
 *   5 // 최대 5개 항목 동시 처리
 * );
 *
 * @remarks
 * 이 연산자는 여러 스트림의 항목을 동시에 처리할 수 있어 병렬 처리에 유용합니다.
 * count 매개변수로 동시성 수준을 제어할 수 있습니다.
 */
export async function* mergeMap<T, R>(
  stream: PullStream<T>,
  mapper: (value: T) => Promisable<R>,
  count: number = 10,
): PullStream<R> {
  let currentCount = 0;
  let wait: (() => void) | null = null;
  let done = false;
  let error: unknown = null;
  const results: Array<PullStreamResult<R>> = [];

  const runMapper = () => {
    if (done || count <= currentCount) {
      return;
    }

    currentCount += 1;
    void stream
      .next()
      .then(async (val) => {
        if (val.done) {
          done = true;
          results.push(val);
        } else {
          const mapped = await mapper(val.value);
          results.push({ done: false, value: mapped });
        }
      })
      .catch((e: unknown) => (error = e))
      .finally(() => wait?.());
  };

  for (let i = 0; i < count; i++) {
    void runMapper();
  }

  while (error !== null || 0 < currentCount) {
    while (error === null && results.length <= 0 && 0 < currentCount) {
      await new Promise<void>((resolve) => (wait = resolve));
    }

    if (0 < results.length) {
      const value = results.pop()!;
      currentCount -= 1;

      if (!value.done) {
        void runMapper();
        yield value.value;
      }

      continue;
    }

    if (error !== null) {
      throw error as Error;
    }
  }
}
