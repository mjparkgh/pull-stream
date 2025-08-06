import { Promisable } from '../core/promisable.js';
import { PullStream } from '../core/pull-stream.js';
/**
 * Operator that applies a transformation function to each item in the stream.
 *
 * @template T Input stream data type
 * @template R Output stream data type
 * @param stream Input stream
 * @param mapper Function that transforms each item
 * @returns Stream of transformed items
 *
 * @example
 * // Double each item in a number stream
 * const doubledStream = map(numberStream, x => x * 2);
 *
 * // Use async transformation function
 * const asyncTransformed = map(stream, async item => {
 *   const result = await fetchData(item);
 *   return result.data;
 * });
 */

export async function* map<T, R>(
  stream: PullStream<T>,
  mapper: (val: T) => Promisable<R>,
): PullStream<R> {
  for await (const value of stream) {
    yield mapper(value);
  }
}

/**
 * Transforms each element in arrays from the input stream using a mapper function.
 * Creates new arrays for each transformation, preserving the original arrays.
 *
 * @template T - Input element type
 * @template R - Output element type after transformation
 * @param stream - Input stream that yields arrays of type T
 * @param mapper - Function that transforms each element from T to R
 * @returns A pull stream that yields new arrays of type R
 *
 * @example
 * ```typescript
 * import { eachMap } from './each-map.js';
 * import { from } from '../generator/from.js';
 *
 * const numberArrays = from([1, 2, 3], [4, 5, 6]);
 * const stringArrays = eachMap(numberArrays, x => x.toString());
 *
 * for await (const arr of stringArrays) {
 *   console.log(arr); // ['1', '2', '3'], then ['4', '5', '6']
 * }
 * ```
 */
export async function* eachMap<T, R>(
  stream: PullStream<T[]>,
  mapper: (val: T) => R,
): PullStream<R[]> {
  for await (const src of stream) {
    yield src.map(mapper);
  }
}

/**
 * Transforms each element in arrays from the input stream using a mapper function.
 * This function performs in-place transformation, reusing the original array memory for efficiency.
 *
 * @template T - Input element type
 * @template R - Output element type after transformation
 * @param stream - Input stream that yields arrays of type T
 * @param mapper - Function that transforms each element from T to R
 * @returns A pull stream that yields arrays of type R
 *
 * @example
 * ```typescript
 * const numberArrays = from([1, 2, 3], [4, 5, 6]);
 * const stringArrays = inplaceEachMap(numberArrays, x => x.toString());
 *
 * for await (const arr of stringArrays) {
 *   console.log(arr); // ['1', '2', '3'], then ['4', '5', '6']
 * }
 * ```
 */
export async function* inplaceEachMap<T, R>(
  stream: PullStream<T[]>,
  mapper: (val: T) => R,
): PullStream<R[]> {
  for await (const src of stream) {
    const dst = src as unknown[];
    for (let i = 0; i < src.length; i += 1) {
      dst[i] = mapper(src[i]);
    }
    yield dst as R[];
  }
}
