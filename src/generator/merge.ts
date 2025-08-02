import { PullStream } from '../types/pull-stream.js';

/**
 * 여러 스트림을 단일 스트림으로 병합하여 동시 처리를 관리합니다
 *
 * @template T - 입력 스트림의 데이터 유형
 * @param {PullStream<T>[]} streamList - 병합할 입력 스트림 배열
 * @param {number} [count=10] - 동시에 처리할 최대 스트림 수
 * @returns {PullStream<T>} 모든 입력 스트림의 항목을 생성하는 단일 병합 스트림
 *
 * @example
 * // 여러 스트림 병합하기
 * const combinedStream = merge(
 *   [stream1, stream2, stream3],
 *   5 // 최대 5개 스트림을 동시에 처리
 * );
 *
 * @remarks
 * 이 연산자는 여러 스트림의 항목을 병렬 처리하는 데 유용합니다.
 * count 매개변수로 동시성 수준을 제어합니다.
 */
export async function* merge<T>(
  streamList: PullStream<T>[],
  count: number = 10,
): PullStream<T> {
  const stack = streamList.slice();
  const currentStreamList: Array<PullStream<T>> = [];
  const results: Array<[number, IteratorResult<T, void>]> = [];
  let wait: (() => void) | null = null;
  let error: unknown = null;
  let remain: number = streamList.length;

  const startStream = (param: PullStream<T>, index: number) =>
    param
      .next()
      .then((res) => results.push([index, res]))
      .catch((e: unknown) => (error = e))
      .finally(() => wait?.());

  for (let i = 0; i < Math.min(streamList.length, count); i += 1) {
    const stream = stack.pop()!;
    currentStreamList.push(stream);
    void startStream(stream, i);
  }

  while (error !== null || 0 < results.length || 0 < remain) {
    while (error === null && results.length <= 0) {
      await new Promise<void>((res) => (wait = res));
    }

    if (error !== null) {
      throw error as Error;
    }

    const [index, result] = results.pop()!;

    if (result.done) {
      remain -= 1;
      const next = stack.pop() ?? null;
      if (next) {
        currentStreamList[index] = next;
        void startStream(next, index);
      }
    } else {
      void startStream(currentStreamList[index], index);
    }

    if (!result.done) {
      yield result.value;
    }
  }
}
