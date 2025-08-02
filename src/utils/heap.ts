import { PullStreamError } from './pull-stream-error.js';

type Comparable = string | number;

/**
 * Min Heap data structure implementation.
 * @template V - Type of value to store
 * @template K - Type of key for ordering (string or number)
 */
export class Heap<V, K extends Comparable = number> {
  #MIN_SIZE: number = 32;
  #key: (value: V) => K;
  #size: number = 0;
  #buf: Array<[K, V]>;

  /**
   * Calculates the smallest power of two greater than or equal to n.
   * @param n - Minimum required size
   * @returns Calculated heap buffer size
   */
  #getHeapSize(n: number): number {
    return 1 << (31 - Math.clz32(n));
  }

  /**
   * Creates a Heap instance.
   * @param key - Function to extract ordering key from value
   * @param initSize - Initial buffer size (default: MIN_SIZE)
   */
  constructor(key: (value: V) => K, initSize?: number) {
    const size = initSize ?? this.#MIN_SIZE;
    this.#key = key;
    const length = this.#getHeapSize(Math.max(size + 1, this.#MIN_SIZE));
    this.#buf = new Array<[K, V]>(length);
    this.#buf[0] = null as unknown as [K, V];
    this.#size = 1;
  }

  /**
   * Creates a Heap instance using the value itself as the key.
   * @template V - Value type (must be Comparable)
   * @param initSize - Initial buffer size (optional)
   * @returns New Heap instance
   */
  static create<V extends Comparable = number>(initSize?: number) {
    return new Heap<V, V>((v) => v, initSize);
  }

  /**
   * Creates a Heap from an array, using the value itself as the key.
   * @template V - Value type (must be Comparable)
   * @param items - Initial items array
   * @returns New Heap instance
   */
  static with<V extends Comparable = number>(items: V[]): Heap<V, V> {
    return Heap.from(items, (v) => v);
  }

  /**
   * Creates a Heap from an array and key extractor function (heapify).
   * @template V - Value type
   * @template K - Key type (must be Comparable)
   * @param items - Initial items array
   * @param key - Function to extract ordering key from value
   * @returns New Heap instance
   * @throws {PullStreamError} If items is empty or not an array
   */
  static from<V, K extends Comparable = number>(
    items: V[],
    key: (value: V) => K,
  ): Heap<V, K> {
    if (!Array.isArray(items) || items.length <= 0) {
      throw new PullStreamError(
        'ITEMS_IS_EMPTY',
        'items parameter is empty or not array',
      );
    }

    const initSize = items.length;
    const heap = new Heap<V, K>(key, initSize);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemKey = heap.#key(item);
      heap.#buf[i + 1] = [itemKey, item];
    }
    heap.#size = items.length + 1;

    for (let i = Math.floor(initSize / 2); i > 0; i--) {
      heap.#shiftDown(i);
    }

    return heap;
  }

  /**
   * Resizes the internal buffer.
   * @param length - New buffer length
   */
  #resize(length: number): void {
    const newbuf = new Array<[K, V]>(length);
    for (let i = 0; i < this.#size; i++) {
      newbuf[i] = this.#buf[i];
    }
    this.#buf = newbuf;
  }

  /**
   * Expands the buffer if it is full.
   */
  #extendIfNeeded(): void {
    if (this.#isFull()) {
      this.#resize(this.#buf.length << 1);
    }
  }

  /**
   * Shrinks the buffer if usage is low.
   */
  #shrinkIfNeeded(): void {
    const halfSize = this.#buf.length >> 1;
    const quadSize = halfSize >> 1;
    if (this.#MIN_SIZE <= halfSize && this.#size < quadSize) {
      this.#resize(halfSize);
    }
  }

  /**
   * Checks if the buffer is full.
   * @returns True if buffer is full
   */
  #isFull(): boolean {
    return this.#size === this.#buf.length;
  }

  /**
   * Checks if the heap is empty.
   * @returns True if heap is empty
   */
  isEmpty(): boolean {
    return this.#size === 1;
  }

  /**
   * Returns the number of elements in the heap.
   */
  get size(): number {
    return this.#size - 1;
  }

  /**
   * Adds a new item to the heap.
   * @param item - Item to add
   */
  push(item: V): void {
    this.#extendIfNeeded();

    const key = this.#key(item);
    let idx = this.#size;

    this.#size += 1;
    this.#buf[idx] = [key, item];

    while (idx !== 1) {
      const upIdx = idx >> 1;
      const up = this.#buf[upIdx];
      const curr = this.#buf[idx];

      if (up[0] <= curr[0]) {
        break;
      }

      this.#buf[upIdx] = curr;
      this.#buf[idx] = up;

      idx >>= 1;
    }
  }

  /**
   * Maintains heap property by shifting down from the given index.
   * @param index - Start index
   */
  #shiftDown(index: number): void {
    let i = index;

    while (true) {
      const down = i << 1;
      let tgt = i;

      if (down < this.#size && this.#buf[down][0] < this.#buf[tgt][0]) {
        tgt = down;
      }

      if (down + 1 < this.#size && this.#buf[down + 1][0] < this.#buf[tgt][0]) {
        tgt = down + 1;
      }

      if (i === tgt) {
        break;
      }

      const tmp = this.#buf[tgt];
      this.#buf[tgt] = this.#buf[i];
      this.#buf[i] = tmp;

      i = tgt;
    }
  }

  /**
   * Removes and returns the minimum value (root) from the heap.
   * @returns Minimum value in the heap
   * @throws {PullStreamError} If heap is empty
   */
  pop(): V {
    if (this.isEmpty()) {
      throw new PullStreamError(
        'QUEUE_EMPTY',
        'Queue is empty, cannot dequeue.',
      );
    }

    const value = this.#buf[1][1];
    this.#size -= 1;

    if (!this.isEmpty()) {
      this.#buf[1] = this.#buf[this.#size];
      this.#buf[this.#size] = null as unknown as [K, V];
      this.#shiftDown(1);
    }

    this.#shrinkIfNeeded();

    return value;
  }

  /**
   * Returns the minimum value (root) without removing it.
   * @returns Minimum value in the heap
   * @throws {PullStreamError} If heap is empty
   */
  peek(): V {
    if (this.isEmpty()) {
      throw new PullStreamError('HEAP_EMPTY', 'Heap is empty, cannot peek.');
    }

    return this.#buf[1][1];
  }

  /**
   * Removes all elements from the heap.
   */
  clear(): void {
    this.#buf = new Array<[K, V]>(this.#MIN_SIZE);
    this.#buf[0] = null as unknown as [K, V];
    this.#size = 1;
  }
}
