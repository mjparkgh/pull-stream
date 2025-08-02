import { PullStream } from '../types/pull-stream.js';

/**
 * 풀 기반 스트림에서 현재 값이 처리되는 동안 다음 값을 미리 가져옵니다.
 *
 * 이 함수는 다음 값을 미리 가져와서 스트림 처리 성능을 향상시킵니다.
 * 값 처리에 상당한 시간이 소요될 때 반복 간의 대기 시간을 줄일 수 있습니다.
 *
 * @template T - 스트림의 요소 타입
 * @param {PullStream<T>} stream - 값을 미리 가져올 원본 풀 기반 스트림
 * @returns {PullStream<T>} 입력 스트림에서 값을 미리 가져오는 새 스트림
 *
 * @example
 * const originalStream = createPullStream();
 * const prefetchedStream = prefetch(originalStream);
 *
 * for await (const value of prefetchedStream) {
 *   // 다음 값이 가져와지는 동안 현재 값 처리
 *   processValue(value);
 * }
 */
export async function* prefetch<T>(stream: PullStream<T>): PullStream<T> {
  let next: Promise<IteratorResult<T, void>> | null = stream.next();

  while (true) {
    if (next === null) {
      return;
    }

    const result = await next;

    if (result.done) {
      next = null;
    } else {
      next = stream.next();
      yield result.value;
    }
  }
}
