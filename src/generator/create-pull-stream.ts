import { PullStream, PullStreamCallback } from '../types/pull-stream.js';

/**
 * 콜백 기반 API로부터 비동기 풀 스트림을 생성하는 함수
 *
 * @template T - 입력 데이터 타입
 * @template R - 출력 데이터 타입
 * @param {PullStreamCallback<T, R>} cb - 각 단계의 데이터를 생성하는 콜백 함수
 * @returns {PullStream<R>} 생성된 스트림
 *
 * @example
 * // 배열을 스트림으로 변환
 * const stream = createPullStream(input => {
 *   if (input === null) {
 *     // 초기 입력일 경우 첫 번째 항목 반환
 *     return { next: 0, data: myArray[0] };
 *   }
 *
 *   const nextIndex = input + 1;
 *   if (nextIndex < myArray.length) {
 *     return { next: nextIndex, data: myArray[nextIndex] };
 *   } else {
 *     // 더 이상 항목이 없을 경우 null 반환으로 종료
 *     return { next: null, data: myArray[input] };
 *   }
 * });
 */
export async function* createPullStream<T, R>(
  cb: PullStreamCallback<T, R>,
): PullStream<R> {
  let next: T | null = null;

  do {
    const res = await cb(next);
    yield res.data;
    next = res.next;
  } while (next !== null);
}
