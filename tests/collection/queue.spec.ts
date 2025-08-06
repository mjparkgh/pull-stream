import { describe, it, expect } from 'vitest';
import { Queue } from '../../src/collection/queue.js';
import { PullStreamError } from '../../src/core/pull-stream-error.js';

describe('Queue', () => {
  it('should be empty on creation', () => {
    const queue = new Queue<number>();
    expect(queue.isEmpty()).toEqual(true);
    expect(queue.size).toEqual(0);
  });

  it('should enqueue and dequeue items in FIFO order', () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(queue.size).toEqual(3);
    expect(queue.peek()).toEqual(1);
    expect(queue.dequeue()).toEqual(1);
    expect(queue.dequeue()).toEqual(2);
    expect(queue.dequeue()).toEqual(3);
    expect(queue.isEmpty()).toEqual(true);
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
    const first = Array.from({ length: 16 }, (_, i) => i + 1);
    const second = Array.from({ length: 64 }, (_, i) => i + 1);
    queue.batchEnqueue(first);
    queue.batchEnqueue(second);
    expect(queue.size).toEqual(80);
    const items = queue.batchDequeue(50);
    expect(items.length).toEqual(50);
    expect(items).toEqual(first.concat(second.slice(0, 34)));
    expect(queue.size).toEqual(30);
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
    expect(queue.size).toEqual(3);
    expect(queue.dequeue()).toEqual(5);
    expect(queue.dequeue()).toEqual(6);
    expect(queue.dequeue()).toEqual(7);
    expect(queue.isEmpty()).toEqual(true);
  });

  it('should clear the queue', () => {
    const queue = new Queue<number>();
    queue.enqueue(100);
    queue.clear();
    expect(queue.isEmpty()).toEqual(true);
    expect(queue.size).toEqual(0);
    expect(() => queue.peek()).toThrow(PullStreamError);
  });
});
