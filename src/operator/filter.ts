import { Promisable } from '../types/promisable.js';
import { PullStream } from '../types/pull-stream.js';

/**
 * 주어진 조건에 맞는 항목만 통과시키는 필터 연산자
 *
 * @template T - 스트림의 데이터 타입
 * @param {PullStream<T>} generator - 입력 스트림
 * @param {function} predicate - 각 항목을 테스트하는 조건 함수
 * @returns {PullStream<T>} 조건을 만족하는 항목들만 포함한 스트림
 *
 * @example
 * // 짝수만 필터링
 * const evenNumbers = filter(numberStream, x => x % 2 === 0);
 *
 * // 비동기 조건 함수 사용
 * const validItems = filter(sourceStream, async item => {
 *   const isValid = await validateItem(item);
 *   return isValid;
 * });
 */
export async function* filter<T>(
  stream: PullStream<T>,
  predicate: (value: T) => Promisable<boolean>,
): PullStream<T> {
  for await (const value of stream) {
    if (await predicate(value)) {
      yield value;
    }
  }
}
