import { PullStreamError } from '../core/pull-stream-error.js';

/**
 * Circular array-based queue implementation.
 *
 * This queue uses a circular array with power-of-two size internally
 * to perform enqueue and dequeue operations with O(1) time complexity.
 *
 * @template T Type of elements stored in the queue
 *
 * @example
 * const queue = new Queue<number>();
 * queue.enqueue(1);
 * queue.enqueue(2);
 * queue.enqueue(3);
 *
 * while (!queue.isEmpty()) {
 *   console.log(queue.dequeue()); // 1, 2, 3
 * }
 */
export class Queue<T> {
  #MIN_SIZE: number = 32;

  #queue: Array<T>;
  #front: number = 0;
  #rear: number = 0;
  #mask: number;

  #calculateQueueSize(n: number): number {
    const lastOne = 1 << (31 - Math.clz32(n));
    if (lastOne === n) {
      return n;
    }
    return lastOne << 1;
  }

  constructor(initSize: number = 32) {
    const length = this.#calculateQueueSize(Math.max(initSize, this.#MIN_SIZE));
    this.#queue = new Array<T>(length);
    this.#mask = length - 1;
  }

  /**
   * Creates a queue from the given array.
   *
   * @param items Array of elements to initialize the queue with
   * @returns Created queue instance
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
   * Checks if the queue is empty.
   *
   * @returns True if the queue is empty, false otherwise
   */
  isEmpty(): boolean {
    return this.#front === this.#rear;
  }

  /**
   * Returns the number of items stored in the queue.
   *
   * @returns Number of items in the queue
   */
  get size(): number {
    return (this.#rear - this.#front + this.#queue.length) & this.#mask;
  }

  /**
   * Adds a new element to the end of the queue.
   * Automatically expands the queue size if it's full.
   *
   * @param item Element to add
   */
  enqueue(item: T): void {
    if (this.#isFull()) {
      this.#extendQueue();
    }
    this.#queue[this.#rear] = item;
    this.#rear = (this.#rear + 1) & this.#mask;
  }

  /**
   * Adds multiple items to the queue at once.
   * Automatically expands the queue size if needed.
   *
   * @param items Array of items to add
   */
  batchEnqueue(items: T[]): void {
    const size = this.size;
    const availableSpace = this.#queue.length - size - 1;

    if (items.length > availableSpace) {
      const newSize = this.#calculateQueueSize(
        this.#queue.length + items.length - availableSpace,
      );
      this.#resizeQueue(newSize);
    }

    for (let i = 0; i < items.length; i++) {
      this.#queue[this.#rear] = items[i];
      this.#rear = (this.#rear + 1) & this.#mask;
    }
  }
  /**
   * Removes the specified number of items from the queue at once and returns them as an array.
   *
   * @param count Number of items to remove
   * @returns Array of removed items
   * @throws {PullStreamError} If there are fewer items in the queue than requested
   */
  batchDequeue(count: number): T[] {
    const currSize = this.size;

    if (count > currSize) {
      throw new PullStreamError(
        'QUEUE_UNDERFLOW',
        `Cannot dequeue ${count} items, only ${currSize} available.`,
      );
    }

    const items: T[] = new Array<T>(count);
    for (let i = 0; i < count; i++) {
      const item = this.#queue[this.#front];
      this.#queue[this.#front] = null as unknown as T;
      this.#front = (this.#front + 1) & this.#mask;
      items[i] = item;
    }

    this.#shrinkQueueIfNeeded();
    return items;
  }

  /**
   * Removes and returns an element from the front of the queue.
   * Automatically shrinks the queue size if usage is low.
   *
   * @returns Removed element
   * @throws {PullStreamError} If the queue is empty
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
   * Returns the front item of the queue without removing it.
   *
   * @returns Front item of the queue
   * @throws {PullStreamError} If the queue is empty
   */
  peek(): T {
    if (this.isEmpty()) {
      throw new PullStreamError('QUEUE_EMPTY', 'Queue is empty, cannot peek.');
    }
    return this.#queue[this.#front];
  }

  /**
   * Removes all elements from the queue.
   */
  clear(): void {
    this.#front = 0;
    this.#rear = 0;
    this.#queue = new Array<T>(this.#MIN_SIZE);
    this.#mask = this.#MIN_SIZE - 1;
  }
}
