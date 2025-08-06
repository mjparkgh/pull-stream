import { Promisable } from '../core/promisable.js';
import { PullStream } from '../core/pull-stream.js';

/**
 * Operator that maps errors occurring in a stream to a value using the provided function.
 *
 * When an error is thrown during iteration of the input `stream`, the error is passed to `mapError`
 * and the resulting value is yielded instead.
 *
 * @template T Type of values in the stream
 * @param stream PullStream<T> The input stream to process
 * @param mapError (e: unknown) => Promisable<T> Function to map errors to a value
 * @returns PullStream<T> A stream yielding original values and mapped error values
 *
 * @example
 * ```typescript
 * import { mapError } from './operator/map-error.js';
 *
 * async function* errorStream() {
 *   yield 1;
 *   throw new Error('fail');
 * }
 *
 * const mapped = mapError(errorStream(), (e) => {
 *   if (e instanceof Error) return -1;
 *   return 0;
 * });
 *
 * for await (const v of mapped) {
 *   console.log(v); // 1, -1
 * }
 * ```
 */
export async function* mapError<T>(
  stream: PullStream<T>,
  mapError: (e: unknown) => Promisable<T>,
): PullStream<T> {
  try {
    yield* stream;
  } catch (error) {
    yield mapError(error);
  }
}
