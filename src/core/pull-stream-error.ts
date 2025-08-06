/**
 * Error class representing errors that occur during pull-based stream processing.
 *
 * @example
 * // Create and use error
 * throw new PullStreamError(
 *   'INVALID_STREAM',
 *   'Invalid stream format',
 *   originalError
 * );
 *
 * // Handle error
 * try {
 *   // Stream operations
 * } catch (error) {
 *   if (error instanceof PullStreamError) {
 *     console.error(`Error code: ${error.code}, Message: ${error.message}`);
 *   }
 * }
 */
export class PullStreamError extends Error {
  readonly code: string;

  /**
   * Creates a new PullStreamError instance.
   * @param rawCode Error code (raw code without prefix)
   * @param message Error message
   * @param cause Object that caused the error
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
