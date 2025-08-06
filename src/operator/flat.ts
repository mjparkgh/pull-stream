import { PullStream } from '../core/pull-stream.js';

/**
 * Flattens a PullStream<T[]> stream to return individual elements as an async generator function.
 *
 * @template T Type of elements to process in the stream
 * @param stream PullStream containing arrays of T
 * @returns Flattened PullStream containing individual elements
 *
 * @example
 * async function* batchStream(): PullStream<number[]> {
 *   yield [1, 2];
 *   yield [3, 4];
 * }
 *
 * for await (const value of flat(batchStream())) {
 *   console.log(value); // 1, 2, 3, 4
 * }
 */
export async function* flat<T>(stream: PullStream<T[]>): PullStream<T> {
  for await (const batch of stream) {
    yield* batch;
  }
}
