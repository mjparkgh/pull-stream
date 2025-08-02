import { Promisable } from '../types/promisable.js';
import { PullStream } from '../types/pull-stream.js';
/**
 * 스트림의 각 항목에 변환 함수를 적용하는 연산자
 *
 * @template T - 입력 스트림의 데이터 타입
 * @template R - 출력 스트림의 데이터 타입
 * @param {PullStream<T>} generator - 입력 스트림
 * @param {function} mapper - 각 항목을 변환하는 함수
 * @returns {PullStream<R>} 변환된 항목들의 스트림
 *
 * @example
 * // 숫자 스트림의 각 항목을 두 배로 만들기
 * const doubledStream = map(numberStream, x => x * 2);
 *
 * // 비동기 변환 함수 사용
 * const asyncTransformed = map(stream, async item => {
 *   const result = await fetchData(item);
 *   return result.data;
 * });
 */

export async function* map<T, R>(
  stream: PullStream<T>,
  mapper: (val: T) => Promisable<R>,
): PullStream<R> {
  for await (const value of stream) {
    yield mapper(value);
  }
}
