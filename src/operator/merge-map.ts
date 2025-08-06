import { Promisable } from '../core/promisable.js';
import { PullStream, PullStreamResult } from '../core/pull-stream.js';

/**
 * Operator that merges multiple streams and applies a transformation function to each item.
 *
 * @template T Input stream data type
 * @template R Output stream data type
 * @param stream Single or multiple input streams
 * @param mapper Function that transforms each item
 * @param count Maximum number of items to process concurrently (default: 10)
 * @returns Merged stream of transformed items
 *
 * @example
 * // Merge multiple streams and transform
 * const combinedStream = mergeMap(
 *   [stream1, stream2, stream3],
 *   async item => {
 *     const result = await processItem(item);
 *     return result;
 *   },
 *   5 // Process up to 5 items concurrently
 * );
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
