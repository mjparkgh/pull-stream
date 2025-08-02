import { PullStreamError } from './pull-stream-error.js';

/**
 * 순환 배열 기반의 큐 구현체
 *
 * 이 큐는 내부적으로 2의 거듭제곱 크기를 가진 순환 배열을 사용하여
 * O(1)의 시간 복잡도로 enqueue와 dequeue 작업을 수행합니다.
 *
 * @template T - 큐에 저장될 요소의 타입
 */
export class Queue<T> {
  #MIN_SIZE: number = 32; // 최소 크기

  #queue: Array<T>;
  #front: number = 0;
  #rear: number = 0;
  #mask: number;

  #calculateQueueSize(n: number): number {
    return 1 << (31 - Math.clz32(n));
  }
  constructor(initSize: number = 32) {
    const length = this.#calculateQueueSize(Math.max(initSize, this.#MIN_SIZE));
    this.#queue = new Array<T>(length);
    this.#mask = length - 1;
  }

  /**
   * 주어진 배열로부터 큐를 생성합니다.
   *
   * @param items - 큐에 초기화할 요소들의 배열
   * @returns 생성된 큐 인스턴스
   */
  static from<T>(items: T[]): Queue<T> {
    const queue = new Queue<T>(items.length + 1);
    for (let i = 0; i < items.length; i++) {
      queue.#queue[i] = items[i];
    }
    queue.#rear = items.length;
    return queue;
  }

  #resizeQueue(length: number): void {
    const newQueue = new Array<T>(length);

    const itemCount = this.size;

    for (let i = 0; i < itemCount; i++) {
      newQueue[i] = this.#queue[(this.#front + i) & this.#mask];
    }

    this.#queue = newQueue;
    this.#front = 0;
    this.#rear = itemCount;
    this.#mask = length - 1;
  }

  #extendQueue(): void {
    this.#resizeQueue(this.#queue.length << 1);
  }

  #shrinkQueueIfNeeded(): void {
    const size = this.size;
    const halfSize = this.#queue.length >> 1;
    const quadSize = halfSize >> 1;
    if (this.#MIN_SIZE <= halfSize && size < quadSize) {
      this.#resizeQueue(halfSize);
    }
  }

  #isFull(): boolean {
    return ((this.#rear + 1) & this.#mask) === this.#front;
  }

  /**
   * 큐가 비어있는지 확인합니다.
   *
   * @returns 큐가 비어있으면 true, 그렇지 않으면 false
   */
  isEmpty(): boolean {
    return this.#front === this.#rear;
  }

  /**
   * 큐에 저장된 항목의 개수를 반환합니다.
   *
   * @returns 큐에 있는 항목의 개수
   */
  get size(): number {
    return (this.#rear - this.#front + this.#queue.length) & this.#mask;
  }

  /**
   * 큐의 끝에 새 요소를 추가합니다.
   * 큐가 가득 찼을 경우 자동으로 크기가 확장됩니다.
   *
   * @param item - 추가할 요소
   */
  enqueue(item: T): void {
    if (this.#isFull()) {
      this.#extendQueue();
    }
    this.#queue[this.#rear] = item;
    this.#rear = (this.#rear + 1) & this.#mask;
  }

  /**
   * 여러 항목을 한 번에 큐에 추가합니다.
   * 필요한 경우 큐의 크기를 자동으로 확장합니다.
   *
   * @param items - 추가할 항목 배열
   */
  batchEnqueue(items: T[]): void {
    const size = this.size;
    const availableSpace = this.#queue.length - size - 1;

    if (items.length > availableSpace) {
      let newSize = this.#queue.length;
      while (newSize - size - 1 < items.length) {
        newSize <<= 1;
      }
      this.#resizeQueue(newSize);
    }

    for (const item of items) {
      this.#queue[this.#rear] = item;
      this.#rear = (this.#rear + 1) & this.#mask;
    }
  }
  /**
   * 큐에서 지정된 개수의 항목을 한 번에 제거하고 배열로 반환합니다.
   *
   * @param count - 제거할 항목 수
   * @returns 제거된 항목들의 배열
   * @throws {PullStreamError} 요청한 항목 수보다 큐에 있는 항목이 적을 경우 에러 발생
   */
  batchDequeue(count: number): T[] {
    const currSize = this.size;

    if (count > currSize) {
      throw new PullStreamError(
        'QUEUE_UNDERFLOW',
        `Cannot dequeue ${count} items, only ${currSize} available.`,
      );
    }

    const items: T[] = [];
    for (let i = 0; i < count; i++) {
      const item = this.#queue[this.#front];
      this.#queue[this.#front] = item;
      this.#front = (this.#front + 1) & this.#mask;
      items.push(item);
    }

    this.#shrinkQueueIfNeeded();
    return items;
  }

  /**
   * 큐의 앞에서 요소를 제거하고 반환합니다.
   * 사용률이 낮을 경우 자동으로 큐의 크기를 줄입니다.
   *
   * @returns 제거된 요소
   * @throws {PullStreamError} 큐가 비어있을 경우 QUEUE_EMPTY 에러 발생
   */
  dequeue(): T {
    if (this.isEmpty()) {
      throw new PullStreamError(
        'QUEUE_EMPTY',
        'Queue is empty, cannot dequeue.',
      );
    }

    const item = this.#queue[this.#front];
    this.#queue[this.#front] = null as unknown as T;
    this.#front = (this.#front + 1) & this.#mask;

    this.#shrinkQueueIfNeeded();

    return item;
  }

  /**
   * 큐의 맨 앞 항목을 제거하지 않고 조회합니다.
   *
   * @returns 큐의 맨 앞 항목
   * @throws {PullStreamError} 큐가 비어있을 경우 에러 발생
   */
  peek(): T {
    if (this.isEmpty()) {
      throw new PullStreamError('QUEUE_EMPTY', 'Queue is empty, cannot peek.');
    }
    return this.#queue[this.#front];
  }

  /**
   * 큐의 모든 요소를 제거합니다.
   */
  clear(): void {
    this.#front = 0;
    this.#rear = 0;
    this.#queue = new Array<T>(this.#MIN_SIZE);
    this.#mask = this.#MIN_SIZE - 1;
  }
}
