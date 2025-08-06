import { PullStream } from '../core/pull-stream.js';

/**
 * Prefetches the next value while the current value is being processed in a pull-based stream.
 *
 * This function improves stream processing performance by prefetching the next value,
 * reducing wait time between iterations when value processing takes significant time.
 *
 * @template T Type of stream elements
 * @param stream Original pull-based stream to prefetch values from
 * @returns New stream with prefetched values from the input stream
 *
 * @example
 * const originalStream = createPullStream();
 * const prefetchedStream = prefetch(originalStream);
 *
 * for await (const value of prefetchedStream) {
 *   // Process current value while next value is being fetched
 *   processValue(value);
 * }
 */
export async function* prefetch<T>(stream: PullStream<T>): PullStream<T> {
  let next: Promise<IteratorResult<T, void>> | null = stream.next();

  while (true) {
    if (next === null) {
      return;
    }

    const result = await next;

    if (result.done) {
      next = null;
    } else {
      next = stream.next();
      yield result.value;
    }
  }
}
