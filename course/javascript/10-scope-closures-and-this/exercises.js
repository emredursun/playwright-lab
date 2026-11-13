/**
 * ============================================================================
 *  EXERCISES 10 — Scope, Closures & `this`
 * ============================================================================
 *  Run:  node course/javascript/10-scope-closures-and-this/exercises.js
 *
 *  How to work:
 *    1. Replace each `throw new Error('TODO')` with your solution.
 *    2. Run the file. Every test must pass (✔). Failing tests show what's wrong.
 *    3. Answer the self-check questions in your head or on paper.
 *    4. Only THEN compare with solutions.js.
 *
 *  Struggling a bit is good: it's how memory is built. Give each exercise at
 *  least 10 minutes before you peek.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// ----------------------------------------------------------------------------
// Exercise 1 — Private counter with a step
// createStepCounter(step) returns { next, current }.
//   next()    -> adds `step` to an internal total and returns the new total
//   current() -> returns the total without changing it
// The total must NOT be reachable from outside (no `total` property).
// ----------------------------------------------------------------------------
function createStepCounter(step) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 2 — Call-once function
// once(fn) returns a function that calls `fn` the first time and returns its
// result. Every later call returns that SAME first result without calling fn.
// ----------------------------------------------------------------------------
function once(fn) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 3 — Memoize with a call counter
// memoizeWithStats(fn) returns { call, misses }.
//   call(input) -> fn(input), cached by input (use a Map, Lesson 15 preview)
//   misses()    -> how many times fn was REALLY called
// ----------------------------------------------------------------------------
function memoizeWithStats(fn) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 4 — Fix the lost `this`
// The `report` object below is correct. Make getReporter() return a function
// that still prints the right summary when called on its own: reporter().
// Don't change `report` itself.
// ----------------------------------------------------------------------------
const report = {
  passed: 8,
  failed: 2,
  summary() {
    return `${this.passed} passed, ${this.failed} failed`;
  },
};

function getReporter() {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 5 (bonus) — Arrow callbacks inside a method
// Complete `suite.titles()` so it returns every test title prefixed with the
// suite name, e.g. ['cart > add item', 'cart > remove item'].
// Rule: use this.tests.map(...) with an arrow callback. No `self`, no bind.
// ----------------------------------------------------------------------------
const suite = {
  name: 'cart',
  tests: ['add item', 'remove item'],
  titles() {
    throw new Error('TODO');
  },
};

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.js)
//   Q1. A function defined in file A is called from file B. Whose variables
//       can it see, A's or B's? What is this rule called?
//   Q2. Spot the bug:  setTimeout(loginPage.submit, 100);  where submit()
//       uses `this.page`. What happens, and what are two ways to fix it?
//   Q3. You need per-test state (e.g. a counter of created users) shared by a
//       few helper functions. Would you use a module-level `let`, a closure
//       from a factory, or a class? Explain the trade-off.
//   Q4. Why is an arrow function a BAD choice for an object method that uses
//       `this`, but a GOOD choice for a callback inside that method?
//   Q5. Does a top-level `const` in an ES module become a property of
//       globalThis?
//
// Review (earlier lessons):
//   R1. (Lesson 07) What makes a function "pure", and why are pure helpers
//       easier to test?
//   R2. (Lesson 06) Why can't you `break` out of forEach, and what do you use
//       instead?
//   R3. (Lesson 01) Why does `for (var i ...)` with callbacks print the last
//       value for every callback?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
const sourceOf = (fn) => fn.toString().replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');

test('1. createStepCounter: keeps a private running total', () => {
  const byTwo = createStepCounter(2);
  assert.equal(byTwo.next(), 2);
  assert.equal(byTwo.next(), 4);
  assert.equal(byTwo.current(), 4);
  assert.equal(byTwo.total, undefined, 'the total must stay private');
  assert.equal(createStepCounter(5).current(), 0, 'each counter is independent');
});

test('2. once: calls the function only the first time', () => {
  let calls = 0;
  const init = once(() => {
    calls += 1;
    return { ready: true };
  });
  const first = init();
  const second = init();
  assert.equal(calls, 1);
  assert.equal(first, second, 'later calls return the same first result');
});

test('3. memoizeWithStats: caches results and counts real calls', () => {
  const double = memoizeWithStats((n) => n * 2);
  assert.equal(double.call(3), 6);
  assert.equal(double.call(3), 6);
  assert.equal(double.call(4), 8);
  assert.equal(double.misses(), 2);
});

test('4. getReporter: a standalone function that keeps `this`', () => {
  const reporter = getReporter();
  assert.equal(reporter(), '8 passed, 2 failed');
  assert.equal(reporter.call(undefined), '8 passed, 2 failed', 'works with no `this` at all');
  report.passed = 9;
  try {
    assert.equal(reporter(), '9 passed, 2 failed', 'read the live report, not a copied string');
  } finally {
    report.passed = 8;
  }
});

test('5. suite.titles (bonus): arrow callback sees the method `this`', () => {
  assert.deepEqual(suite.titles(), ['cart > add item', 'cart > remove item']);
  assert.deepEqual(
    suite.titles.call({ name: 'x', tests: ['t'] }),
    ['x > t'],
    '`this` must come from the call site',
  );
  assert.doesNotMatch(
    sourceOf(suite.titles),
    /\bself\b|\.bind\(|\bfunction\b/,
    'use an arrow callback (no self, bind or function expression)',
  );
});
