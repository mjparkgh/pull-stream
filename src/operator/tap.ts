import { PullStream } from '../core/pull-stream.js';

/**
 * Applies a side effect function to each value in the input stream without modifying the values.
 *
 * @template T - Type of elements in the stream
 * @param stream - Input stream yielding values of type T
 * @param sideEffect - Function to apply to each value for side effects
 * @returns A pull stream yielding the original values
 *
 * @example
 * ```typescript
 * import { tap } from './tap.js';
 * import { from } from '../generator/from.js';
 *
 * const numbers = from([1, 2, 3]);
 * const tapped = tap(numbers, x => console.log('Value:', x));
 *
 * for await (const value of tapped) {
 *   // Logs: Value: 1, Value: 2, Value: 3
 *   // Yields: 1, 2, 3
 * }
 * ```
 */
export async function* tap<T>(
  stream: PullStream<T>,
  sideEffect: (val: T) => void,
): PullStream<T> {
  for await (const value of stream) {
    sideEffect(value);
    yield value;
  }
}

/**
 * Applies a side effect function to each element of every array in the input stream without modifying the arrays.
 *
 * @template T - Type of elements in the arrays
 * @param stream - Input stream yielding arrays of type T
 * @param sideEffect - Function to apply to each element for side effects
 * @returns A pull stream yielding the original arrays
 *
 * @example
 * ```typescript
 * const arrays = from([1, 2], [3, 4]);
 * const tapped = eachTap(arrays, x => console.log('Element:', x));
 *
 * for await (const arr of tapped) {
 *   // Logs: Element: 1, Element: 2, then Element: 3, Element: 4
 *   // Yields: [1, 2], [3, 4]
 * }
 * ```
 */
export async function* eachTap<T>(
  stream: PullStream<T[]>,
  sideEffect: (val: T) => void,
): PullStream<T[]> {
  for await (const value of stream) {
    value.forEach((v) => sideEffect(v));
    yield value;
  }
}
