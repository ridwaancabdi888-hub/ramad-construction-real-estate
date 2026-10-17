import test from 'node:test';
import assert from 'node:assert/strict';
import {createAnimationLoop} from '../animation-loop.mjs';

function createHarness() {
  const callbacks = new Map();
  const cancelled = [];
  const rendered = [];
  let nextId = 1;
  const loop = createAnimationLoop({
    requestFrame(callback) {
      const id = nextId++;
      callbacks.set(id, callback);
      return id;
    },
    cancelFrame(id) {
      cancelled.push(id);
      callbacks.delete(id);
    },
    render(timestamp) {
      rendered.push(timestamp);
    }
  });
  const runNext = timestamp => {
    const [id, callback] = callbacks.entries().next().value;
    callbacks.delete(id);
    callback(timestamp);
  };
  return {loop, callbacks, cancelled, rendered, runNext};
}

test('start schedules exactly one animation frame', () => {
  const {loop, callbacks} = createHarness();
  loop.start();
  loop.start();
  assert.equal(callbacks.size, 1);
  assert.equal(loop.running, true);
});

test('a completed frame renders once and schedules its successor', () => {
  const {loop, callbacks, rendered, runNext} = createHarness();
  loop.start();
  runNext(42);
  assert.deepEqual(rendered, [42]);
  assert.equal(callbacks.size, 1);
});

test('stop cancels the pending frame and prevents stale callbacks rendering', () => {
  const {loop, callbacks, cancelled, rendered} = createHarness();
  loop.start();
  const callback = callbacks.values().next().value;
  loop.stop();
  callback(42);
  assert.deepEqual(cancelled, [1]);
  assert.deepEqual(rendered, []);
  assert.equal(loop.running, false);
});

test('a stopped loop can resume without creating duplicate frames', () => {
  const {loop, callbacks, rendered, runNext} = createHarness();
  loop.start();
  loop.stop();
  loop.start();
  loop.start();
  assert.equal(callbacks.size, 1);
  runNext(84);
  assert.deepEqual(rendered, [84]);
  assert.equal(callbacks.size, 1);
});
