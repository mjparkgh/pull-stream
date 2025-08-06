import { PullStream } from '../core/pull-stream.js';

/**
 * Adjusts the buffer size of arrays from the input stream, emitting arrays of the specified size.
 * Concatenates incoming arrays and splits them into chunks of the given count.
 *
 * @template T - Type of elements in the arrays
 * @param stream - Input stream yielding arrays of type T
 * @param count - Number of items to buffer in each output array
 * @returns A pull stream yielding arrays containing up to `count` items
 *
 * @example
 * ```typescript
 * const batches = from([1,2], [3,4,5], [6]);
 * const adjusted = adjustBufferCount(batches, 3);
 *
 * for await (const batch of adjusted) {
 *   console.log(batch); // [1,2,3], [4,5,6]
 * }
 * ```
 */
export async function* resizeArray<T>(
  stream: PullStream<T[]>,
  count: number,
): PullStream<T[]> {
  let buffer: T[] = [];
  for await (const batch of stream) {
    buffer = buffer.concat(batch);
    if (count <= buffer.length) {
      let i = 0;
      while (i + count <= buffer.length) {
        yield buffer.slice(i, i + count);
        i += count;
      }
      buffer = buffer.slice(i);
    }
  }
  if (0 < buffer.length) {
    yield buffer;
  }
}
