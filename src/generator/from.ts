import { PullStream } from '../types/pull-stream.js';

/**
 * 제공된 인수를 해결된 Promise로 생성하여 반환하는 비동기 제너레이터를 생성합니다.
 *
 * @template T - 생성할 요소의 타입입니다.
 * @param {...T[]} args - 제너레이터가 반환할 값들입니다.
 * @returns {PullStream<T>} `args`의 각 값을 해결된 Promise로 반환하는 비동기 제너레이터입니다.
 */
export async function* from<T>(...args: T[]): PullStream<T> {
  for (const value of args) {
    yield Promise.resolve(value);
  }
}
