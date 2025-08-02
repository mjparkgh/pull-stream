import { describe, it, expect } from 'vitest';
import { Queue } from '../../src/utils/queue.js';
import { PullStreamError } from '../../src/utils/pull-stream-error.js';

describe('Queue', () => {
  it('should be empty on creation', () => {
    const queue = new Queue<number>();
    expect(queue.isEmpty()).toBe(true);
    expect(queue.size).toBe(0);
  });

  it('should enqueue and dequeue items in FIFO order', () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(queue.size).toBe(3);
    expect(queue.peek()).toBe(1);
    expect(queue.dequeue()).toBe(1);
    expect(queue.dequeue()).toBe(2);
    expect(queue.dequeue()).toBe(3);
    expect(queue.isEmpty()).toBe(true);
  });

  it('should throw error when dequeue on empty', () => {
    const queue = new Queue<number>();
    expect(() => queue.dequeue()).toThrow(PullStreamError);
    expect(() => queue.dequeue()).toThrow('Queue is empty, cannot dequeue.');
  });

  it('should throw error when peek on empty', () => {
    const queue = new Queue<string>();
    expect(() => queue.peek()).toThrow(PullStreamError);
    expect(() => queue.peek()).toThrow('Queue is empty, cannot peek.');
  });

  it('should support batchEnqueue and batchDequeue', () => {
    const queue = new Queue<number>();
    queue.batchEnqueue([10, 20, 30, 40]);
    expect(queue.size).toBe(4);
    const items = queue.batchDequeue(2);
    expect(items).toEqual([10, 20]);
    expect(queue.size).toBe(2);
    const rest = queue.batchDequeue(2);
    expect(rest).toEqual([30, 40]);
    expect(queue.isEmpty()).toBe(true);
  });

  it('should throw error on batchDequeue underflow', () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    expect(() => queue.batchDequeue(2)).toThrow(PullStreamError);
    expect(() => queue.batchDequeue(2)).toThrow(
      'Cannot dequeue 2 items, only 1 available.',
    );
  });

  it('should create a queue from array', () => {
    const queue = Queue.from([5, 6, 7]);
    expect(queue.size).toBe(3);
    expect(queue.dequeue()).toBe(5);
    expect(queue.dequeue()).toBe(6);
    expect(queue.dequeue()).toBe(7);
    expect(queue.isEmpty()).toBe(true);
  });

  it('should clear the queue', () => {
    const queue = new Queue<number>();
    queue.enqueue(100);
    queue.clear();
    expect(queue.isEmpty()).toBe(true);
    expect(queue.size).toBe(0);
    expect(() => queue.peek()).toThrow(PullStreamError);
  });
});
