import { describe, it, expect } from 'vitest';
import { PullStreamError } from '../../src/index.js';

describe('PullStreamError', () => {
  it('기본 에러 메시지로 생성할 수 있어야 함', () => {
    const error = new PullStreamError('TEST_ERROR');

    expect(error.name).toBe('PullStreamError');
    expect(error.rawCode).toBe('TEST_ERROR');
    expect(error.code).toBe('PULL_STREAM_TEST_ERROR');
    expect(error.message).toBe('An error occurred');
    expect(error instanceof Error).toBe(true);
  });

  it('사용자 정의 메시지로 생성할 수 있어야 함', () => {
    const errorMessage = '테스트 에러 메시지';
    const error = new PullStreamError('CUSTOM_ERROR', errorMessage);

    expect(error.name).toBe('PullStreamError');
    expect(error.rawCode).toBe('CUSTOM_ERROR');
    expect(error.code).toBe('PULL_STREAM_CUSTOM_ERROR');
    expect(error.message).toBe(errorMessage);
  });

  it('원인 에러를 포함할 수 있어야 함', () => {
    const originalError = new Error('원본 에러');
    const error = new PullStreamError(
      'WRAPPED_ERROR',
      '래핑된 에러',
      originalError,
    );

    expect(error.name).toBe('PullStreamError');
    expect(error.rawCode).toBe('WRAPPED_ERROR');
    expect(error.cause).toBe(originalError);
  });

  it('throw/catch로 올바르게 처리되어야 함', () => {
    expect(() => {
      throw new PullStreamError('ERROR_FOR_TEST');
    }).toThrow(PullStreamError);

    try {
      throw new PullStreamError('CATCH_TEST');
    } catch (error) {
      expect(error instanceof PullStreamError).toBe(true);
      if (error instanceof PullStreamError) {
        expect(error.rawCode).toBe('CATCH_TEST');
      }
    }
  });
});
