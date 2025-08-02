import { PullStream } from '../types/pull-stream.js';

/**
 * 스트림의 항목들을 지정된 개수만큼 묶어서 배열로 반환하는 연산자
 *
 * @template T - 스트림의 데이터 타입
 * @param {PullStream<T>} generator - 입력 스트림
 * @param {number} count - 버퍼링할 항목 개수
 * @returns {PullStream<T[]>} 배열 형태로 묶인 항목들의 스트림
 *
 * @example
 * // 항목 3개씩 묶어서 처리하기
 * const bufferedStream = bufferCount(sourceStream, 3);
 *
 * for await (const batch of bufferedStream) {
 *   // batch는 최대 3개 항목을 포함하는 배열
 *   console.log(`처리할 배치: ${batch.length}개 항목`);
 * }
 *
 * @remarks
 * 스트림이 종료될 때 count보다 적은 항목이 버퍼에 있어도 남은 항목들을 모두 반환합니다.
 */
export async function* bufferCount<T>(
  stream: PullStream<T>,
  count: number,
): PullStream<T[]> {
  let buffer: T[] = [];

  for await (const value of stream) {
    buffer.push(value);
    if (buffer.length === count) {
      const next = buffer;
      buffer = [];
      yield next;
    }
  }
  if (buffer.length > 0) {
    yield buffer;
  }
}
