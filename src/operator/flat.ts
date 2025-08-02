import { PullStream } from '../types/pull-stream.js';

/**
 * 주어진 PullStream<T[]> 스트림을 평탄화하여 개별 요소를 반환하는 비동기 제너레이터 함수입니다.
 *
 * @template T - 스트림에서 처리할 요소의 타입
 * @param {PullStream<T[]>} stream - T 배열을 포함하는 PullStream 스트림
 * @returns {PullStream<T>} 평탄화된 개별 요소를 포함하는 PullStream 스트림
 */
export async function* flat<T>(stream: PullStream<T[]>): PullStream<T> {
  for await (const batch of stream) {
    yield* batch;
  }
}
