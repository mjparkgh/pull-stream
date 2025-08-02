import { PullStream } from '../types/pull-stream.js';

type CallBack<T> = (error: unknown, data: T | null, isDone?: boolean) => void;

/**
 * Push 방식의 스트림을 Pull 방식으로 변환하는 함수
 *
 * @template T - 스트림에서 처리할 데이터 타입
 * @param {function} params - 콜백 함수를 인자로 받는 함수
 * @param {boolean} [useStack=false] - 스택 방식으로 데이터를 처리할지 여부 (true: LIFO, false: FIFO)
 * @returns {PullStream<T>} 비동기 제너레이터
 *
 * @example
 * // 예시: 이벤트 기반 API를 Pull 스트림으로 변환
 * const stream = pushToPullStream((callback) => {
 *   eventEmitter.on('data', (data) => callback(null, data));
 *   eventEmitter.on('error', (err) => callback(err, null));
 *   eventEmitter.on('end', () => callback(null, null, true));
 * });
 *
 * for await (const item of stream) {
 *   console.log(item);
 * }
 */
export async function* pushToPullStream<T>(
  params: (cb: CallBack<T>) => void,
  useStack = false,
): PullStream<T> {
  const queue: T[] = [];
  let error: unknown = null;
  let done = false;
  let signal: (() => void) | null = null;

  const callback = (err: unknown, data: T | null, isDone: boolean = false) => {
    if (done) {
      return;
    }

    if (err) {
      error = err;
      done = true;
    }

    if (data) {
      queue.push(data);
    }

    if (isDone) {
      done = true;
    }

    if (signal) {
      const call = signal;
      signal = null;
      call();
    }
  };

  params(callback);

  while (true) {
    while (queue.length === 0 && !done) {
      await new Promise<void>((resolve) => (signal = resolve));
    }

    if (!queue.length && error) {
      throw error as Error;
    }

    if (!queue.length && done) {
      break;
    }

    if (useStack) {
      yield queue.pop()!;
    } else {
      yield queue.shift()!;
    }
  }
}
