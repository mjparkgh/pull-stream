import { Promisable } from '../core/promisable.js';
import { PullStream } from '../core/pull-stream.js';

/**
 * Filter operator that only passes items meeting the given condition.
 *
 * @template T Stream data type
 * @param stream Input stream
 * @param predicate Condition function that tests each item
 * @returns Stream containing only items that satisfy the condition
 *
 * @example
 * // Filter only even numbers
 * const evenNumbers = filter(numberStream, x => x % 2 === 0);
 *
 * // Use async condition function
 * const validItems = filter(sourceStream, async item => {
 *   const isValid = await validateItem(item);
 *   return isValid;
 * });
 */
export async function* filter<T>(
  stream: PullStream<T>,
  predicate: (value: T) => Promisable<boolean>,
): PullStream<T> {
  for await (const value of stream) {
    if (await predicate(value)) {
      yield value;
    }
  }
}

/**
 * Filters each array from the input stream using a predicate function.
 * Returns a pull stream where each array contains only elements that satisfy the predicate.
 *
 * @template T - Element type of the arrays
 * @param stream - Input stream yielding arrays of type T
 * @param predicate - Function to test each element for inclusion
 * @returns A pull stream yielding filtered arrays of type T
 *
 * @example
 * ```typescript
 * const arrays = from([1, 2, 3], [4, 5, 6]);
 * const filtered = eachFilter(arrays, x => x % 2 === 0);
 *
 * for await (const arr of filtered) {
 *   console.log(arr); // [2], then [4, 6]
 * }
 * ```
 */
export async function* eachFilter<T>(
  stream: PullStream<T[]>,
  predicate: (value: T) => boolean,
): PullStream<T[]> {
  for await (const value of stream) {
    yield value.filter(predicate);
  }
}
