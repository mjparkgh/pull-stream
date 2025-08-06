import { PullStream } from '../core/pull-stream.js';

/**
 * Merges multiple streams into a single stream with concurrent processing management.
 *
 * @template T Input stream data type
 * @param streamList Array of input streams to merge
 * @param count Maximum number of streams to process concurrently (default: 10)
 * @returns Single merged stream that yields items from all input streams
 *
 * @example
 * // Merge multiple streams
 * const combinedStream = merge(
 *   [stream1, stream2, stream3],
 *   5 // Process up to 5 streams concurrently
 * );
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
