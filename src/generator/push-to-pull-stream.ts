import { PullStream } from '../core/pull-stream.js';

type CallBack<T> = (error: unknown, data: T | null, isDone?: boolean) => void;

/**
 * Function that converts push-style streams to pull-style streams.
 *
 * @template T Data type to process in the stream
 * @param params Function that takes a callback function as argument
 * @param useStack Whether to process data in stack mode (true: LIFO, false: FIFO)
 * @returns Async generator
 *
 * @example
 * // Example: Convert event-based API to pull stream
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
