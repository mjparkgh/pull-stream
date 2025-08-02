/**
 * Pull 기반 스트림 처리 중 발생하는 에러를 표현하는 클래스
 *
 * @class PullBasedStreamError
 * @extends {Error}
 *
 * @example
 * // 에러 생성 및 사용
 * throw new PullBasedStreamError(
 *   'INVALID_STREAM',
 *   '유효하지 않은 스트림 형식입니다',
 *   originalError
 * );
 *
 * // 에러 처리
 * try {
 *   // 스트림 작업
 * } catch (error) {
 *   if (error instanceof PullBasedStreamError) {
 *     console.error(`에러 코드: ${error.code}, 메시지: ${error.message}`);
 *   }
 * }
 */
export class PullStreamError extends Error {
  readonly code: string;

  /**
   * @param {string} rawCode - 에러 코드 (접두사 없는 원시 코드)
   * @param {string} [message] - 에러 메시지
   * @param {unknown} [cause] - 에러의 원인이 되는 객체
   */
  constructor(
    readonly rawCode: string,
    message?: string,
    cause?: unknown,
  ) {
    super(message ? message : 'An error occurred', { cause });
    this.code = `PULL_STREAM_${rawCode.toUpperCase()}`;
    this.name = 'PullStreamError';
  }
}
