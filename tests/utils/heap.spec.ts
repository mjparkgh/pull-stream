import { describe, it, expect } from 'vitest';
import { Heap } from '../../src/utils/heap.js';
import { PullStreamError } from '../../src/utils/pull-stream-error.js';

describe('Heap', () => {
  it('should be empty on creation', () => {
    const heap = Heap.create<number>();
    expect(heap.isEmpty()).toBe(true);
    expect(heap.size).toBe(0);
  });

  it('should push and pop items in min order', () => {
    const heap = Heap.create<number>();
    heap.push(5);
    heap.push(2);
    heap.push(8);
    heap.push(1);
    heap.push(3);

    expect(heap.size).toBe(5);
    expect(heap.peek()).toBe(1);
    expect(heap.pop()).toBe(1);
    expect(heap.pop()).toBe(2);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(5);
    expect(heap.pop()).toBe(8);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should throw error when pop on empty', () => {
    const heap = Heap.create<number>();
    expect(() => heap.pop()).toThrow(PullStreamError);
    expect(() => heap.pop()).toThrow('Queue is empty, cannot dequeue.');
  });

  it('should throw error when peek on empty', () => {
    const heap = Heap.create<number>();
    expect(() => heap.peek()).toThrow(PullStreamError);
    expect(() => heap.peek()).toThrow('Heap is empty, cannot peek.');
  });

  it('should create heap from array and pop in min order', () => {
    const arr = [7, 2, 9, 1, 5];
    const heap = Heap.with(arr);
    const result: number[] = [];
    while (!heap.isEmpty()) {
      result.push(heap.pop());
    }
    expect(result).toEqual([1, 2, 5, 7, 9]);
  });

  it('should create heap from array and custom key', () => {
    type Item = { value: number; priority: number };
    const items: Item[] = [
      { value: 1, priority: 30 },
      { value: 2, priority: 10 },
      { value: 3, priority: 20 },
    ];
    const heap = Heap.from(items, (item) => item.priority);
    const result: number[] = [];
    while (!heap.isEmpty()) {
      result.push(heap.pop().value);
    }
    expect(result).toEqual([2, 3, 1]);
  });

  it('should clear the heap', () => {
    const heap = Heap.create<number>();
    heap.push(10);
    heap.push(20);
    heap.clear();
    expect(heap.isEmpty()).toBe(true);
    expect(heap.size).toBe(0);
    expect(() => heap.peek()).toThrow(PullStreamError);
  });

  it('should throw error on Heap.from with empty array', () => {
    expect(() => Heap.from([], (v: number) => v)).toThrow(PullStreamError);
    expect(() => Heap.from([], (v: number) => v)).toThrow(
      'items parameter is empty or not array',
    );
  });
});
