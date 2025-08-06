import { PullStream, PullStreamCallback } from '../core/pull-stream.js';

/**
 * Creates an async pull stream from a callback-based API.
 *
 * @template T Input data type
 * @template R Output data type
 * @param cb Callback function that generates data for each step
 * @returns Generated stream
 *
 * @example
 * // Convert array to stream
 * const stream = createPullStream(input => {
 *   if (input === null) {
 *     // Return first item for initial input
 *     return { next: 0, data: myArray[0] };
 *   }
 *
 *   const nextIndex = input + 1;
 *   if (nextIndex < myArray.length) {
 *     return { next: nextIndex, data: myArray[nextIndex] };
 *   } else {
 *     // Return null to end when no more items
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
