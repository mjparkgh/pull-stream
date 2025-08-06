/**
 * Type representing a value or a promise of that value.
 *
 * @template T Base data type
 *
 * @example
 * // Function can return synchronous or asynchronous result
 * function processItem(item: Item): Promisable<Result> {
 *   if (item.needsAsyncProcessing) {
 *     return fetchDataAsync(item); // Returns Promise<Result>
 *   } else {
 *     return { success: true }; // Returns Result directly
 *   }
 * }
 */
export type Promisable<T> = T | Promise<T>;
