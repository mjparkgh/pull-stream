import { PullStream } from '../core/pull-stream.js';

/**
 * Creates an async generator that yields each provided argument as a resolved Promise.
 *
 * @template T Type of elements to generate
 * @param args Values that the generator will return
 * @returns Async generator that returns each value in `args` as a resolved Promise
 */
export async function* from<T>(...args: T[]): PullStream<T> {
  for (const value of args) {
    yield Promise.resolve(value);
  }
}
