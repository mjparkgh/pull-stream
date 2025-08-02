/**
 * 값 또는 그 값의 프로미스를 나타내는 타입
 *
 * @template T - 기본 데이터 타입
 *
 * @description
 * 이 타입은 동기적으로 즉시 사용 가능한 값이거나, 비동기적으로 프로미스를 통해
 * 나중에 사용 가능해지는 값을 나타냅니다. 비동기 함수와 동기 함수 모두를
 * 지원하는 API를 설계할 때 유용합니다.
 *
 * @example
 * // 함수가 동기적 또는 비동기적 결과를 반환할 수 있도록 함
 * function processItem(item: Item): Promisable<Result> {
 *   if (item.needsAsyncProcessing) {
 *     return fetchDataAsync(item); // Promise<Result> 반환
 *   } else {
 *     return { success: true }; // Result 직접 반환
 *   }
 * }
 */
export type Promisable<T> = T | Promise<T>;
