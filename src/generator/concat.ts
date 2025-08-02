import { PullStream } from '../types/pull-stream.js';

/**
 * Concatenates multiple pull streams into a single stream.
 *
 * Iterates over each stream in the provided list and yields all items from each stream sequentially.
 *
 * @typeParam T - The type of items emitted by the streams.
 * @param streamList - An array of pull streams to concatenate.
 * @returns An async generator that yields items from each stream in order.
 */
export async function* concat<T>(streamList: PullStream<T>[]): PullStream<T> {
  for (const stream of streamList) {
    yield* stream;
  }
}
