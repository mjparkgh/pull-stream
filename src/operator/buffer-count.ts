import { PullStream } from '../core/pull-stream.js';

/**
 * Operator that groups stream items into arrays of a specified size.
 *
 * @template T Stream data type
 * @param stream Input stream
 * @param count Number of items to buffer
 * @returns Stream of arrays containing grouped items
 *
 * @example
 * // Group items by 3
 * const bufferedStream = bufferCount(sourceStream, 3);
 *
 * for await (const batch of bufferedStream) {
 *   // batch is an array containing up to 3 items
 *   console.log(`Batch to process: ${batch.length} items`);
 * }
 */
export async function* bufferCount<T>(
  stream: PullStream<T>,
  count: number,
): PullStream<T[]> {
  let buffer: T[] = [];

  for await (const value of stream) {
    buffer.push(value);
    if (buffer.length === count) {
      const next = buffer;
      buffer = [];
      yield next;
    }
  }
  if (buffer.length > 0) {
    yield buffer;
  }
}
