import { Promisable } from './promisable.js';

/**
 * 비동기 풀 스트림 콜백 결과 타입
 *
 * @template T - 다음 입력 데이터의 타입
 * @template R - 현재 출력 데이터의 타입
 *
 * @property {T | null} next - 다음에 처리할 입력값 (null이면 종료)
 * @property {R} data - 현재 단계에서 생성된 데이터
 */
export type PullStreamCallbackResult<T, R> = {
  next: T | null;
  data: R;
};

/**
 * 비동기 풀 스트림 콜백 함수 타입
 *
 * @template T - 입력 데이터의 타입
 * @template R - 출력 데이터의 타입
 *
 * @param {T | null} input - 현재 처리할 입력값 (null이면 초기 호출)
 * @returns {Promisable<PullStreamCallbackResult<T, R>>} 처리 결과
 */
export type PullStreamCallback<T, R> = (
  input: T | null,
) => Promisable<PullStreamCallbackResult<T, R>>;

/**
 * 비동기 풀 스트림 제너레이터 타입
 *
 * @template T - 제너레이터가 생성하는 데이터의 타입
 *
 * @description
 * 비동기 제너레이터로, 각 항목을 필요에 따라 생성하며 반환하는 Pull 기반 스트림을 나타냅니다.
 */
export type PullStream<T> = AsyncGenerator<T, void, void>;
export type PullStreamResult<T> = IteratorResult<T, void>;
