import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { DRAGON_STATES, nextDragonState: next, DragonStateMachine, NoiseCounter } = require('../activities/sleeping-dragon-core.js');

function feed(counter, level, start, end, canCount = true) {
  let result = null;
  for (let time = start; time <= end; time += 100) {
    const nextResult = counter.sample(time, level, 28, 55, canCount);
    if (nextResult !== null) result = nextResult;
  }
  return result;
}

test('dragon core exposes the seven original logical states', () => {
  assert.deepEqual(DRAGON_STATES, ['sleep', 'stir', 'drowsy', 'resettle', 'wake', 'awake', 'return']);
});

test('all states have a valid path for every sound target', () => {
  for (const state of DRAGON_STATES) for (const target of [0, 1, 2]) assert.ok(DRAGON_STATES.includes(next(state, target)));
});

test('quiet always reaches sleep through the appropriate return state', () => {
  for (const state of DRAGON_STATES) {
    let current = state;
    for (let step = 0; step < 3; step += 1) current = next(current, 0);
    assert.equal(current, 'sleep');
  }
  assert.equal(next('drowsy', 0), 'resettle');
  assert.equal(next('awake', 0), 'return');
});

test('medium holds drowsy while a wake state always returns toward sleep', () => {
  assert.equal(next('stir', 1), 'drowsy');
  assert.equal(next('drowsy', 1), 'drowsy');
  assert.equal(next('drowsy', 2), 'wake');
  assert.equal(next('wake', 2), 'return');
  assert.equal(next('awake', 2), 'return');
});

test('changing a target never cuts the current logical state', () => {
  const machine = new DragonStateMachine('sleep');
  const before = machine.current;
  machine.setTarget(2);
  assert.equal(machine.current, before);
  assert.equal(machine.advance(), 'stir');
  machine.setTarget(0);
  assert.equal(machine.current, 'stir');
  assert.equal(machine.advance(), 'resettle');
});

test('advance follows the most recent target', () => {
  const machine = new DragonStateMachine('drowsy');
  machine.setTarget(2);
  machine.setTarget(0);
  assert.equal(machine.advance(), 'resettle');
});

test('forced valid state is accepted and an invalid state falls back safely', () => {
  const machine = new DragonStateMachine('sleep');
  assert.equal(machine.advance('awake'), 'awake');
  assert.equal(machine.advance('not-a-state'), 'return');
});

test('sound targets are clamped to quiet, medium or loud', () => {
  const machine = new DragonStateMachine('sleep');
  machine.setTarget(-50);
  assert.equal(machine.target, 0);
  machine.setTarget(1.4);
  assert.equal(machine.target, 1);
  machine.setTarget(200);
  assert.equal(machine.target, 2);
});

test('one brief crossing counts immediately and sustained sound counts only once', () => {
  const counter = new NoiseCounter();
  assert.equal(counter.sample(0, 29, 28, 55), null);
  assert.equal(counter.count, 1);
  feed(counter, 90, 100, 12000);
  assert.equal(counter.count, 1);
});

test('three separate crossings request stirring without skipping to waking', () => {
  const counter = new NoiseCounter();
  for (let index = 0; index < 3; index += 1) {
    counter.sample(index * 200, 20, 28, 55);
    assert.equal(counter.sample(index * 200 + 100, 90, 28, 55), index === 2 ? 1 : null);
  }
  assert.equal(counter.count, 3);
});

test('teacher can select one or ten crossings for the second stage', () => {
  for (const limit of [1, 10]) {
    const counter = new NoiseCounter();
    counter.reset(1);
    counter.limits = [3, limit];
    for (let index = 0; index < limit; index += 1) {
      counter.sample(index * 200, 40, 28, 55);
      assert.equal(counter.sample(index * 200 + 100, 80, 28, 55), index === limit - 1 ? 2 : null);
    }
    assert.equal(counter.count, limit);
  }
});

test('quiet clears crossings and requests sleep after 2.5 seconds', () => {
  const counter = new NoiseCounter();
  counter.reset(1);
  counter.sample(0, 80, 28, 55);
  assert.equal(counter.count, 1);
  assert.equal(feed(counter, 10, 100, 2500), null);
  assert.equal(counter.sample(2600, 10, 28, 55), 0);
  assert.equal(counter.count, 0);
});

test('threshold jitter cannot rearm but a three-point fall can', () => {
  const counter = new NoiseCounter();
  counter.sample(0, 30, 28, 55);
  for (let index = 1; index < 20; index += 1) counter.sample(index * 100, index % 2 ? 27 : 29, 28, 55);
  assert.equal(counter.count, 1);
  counter.sample(2000, 25, 28, 55);
  counter.sample(2100, 28, 28, 55);
  assert.equal(counter.count, 2);
});

test('medium volume cannot increment the wake counter', () => {
  const counter = new NoiseCounter();
  counter.reset(1);
  feed(counter, 40, 0, 10000);
  assert.equal(counter.count, 0);
});

test('held input and stage changes cannot invent a crossing', () => {
  const counter = new NoiseCounter();
  counter.sample(0, 80, 28, 55);
  counter.hold();
  counter.sample(100, 80, 28, 55);
  assert.equal(counter.count, 1);
  counter.reset(1, false);
  counter.sample(200, 80, 28, 55);
  assert.equal(counter.count, 0);
  counter.sample(300, 40, 28, 55);
  counter.sample(400, 80, 28, 55);
  assert.equal(counter.count, 1);
});

test('crossings during a transition are consumed rather than deferred', () => {
  const counter = new NoiseCounter();
  counter.reset(1, false);
  counter.sample(0, 40, 28, 55, false);
  counter.sample(100, 80, 28, 55, false);
  counter.sample(200, 80, 28, 55, true);
  assert.equal(counter.count, 0);
  counter.sample(300, 40, 28, 55);
  counter.sample(400, 80, 28, 55);
  assert.equal(counter.count, 1);
});

