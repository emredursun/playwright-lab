/**
 * ============================================================================
 *  SOLUTIONS 10 — Scope, Closures & `this`
 * ============================================================================
 *  Run:  node course/javascript/10-scope-closures-and-this/solutions.js
 *
 *  Compare these with YOUR solutions. If yours is different but the tests pass,
 *  it may be just as good. Read the WHY comments to see the trade-offs.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// Exercise 1
// WHY: `total` lives in the factory's scope. Only the two returned functions
// close over it, so nothing else can read or change it. That's private state
// without classes.
function createStepCounter(step) {
  let total = 0;
  return {
    next: () => (total += step),
    current: () => total,
  };
}

// Exercise 2
// WHY: the closure stores two things, "have I run?" and "what did I return?".
// A separate boolean (instead of checking `result === undefined`) also works
// when fn legitimately returns undefined.
function once(fn) {
  let hasRun = false;
  let result;
  return (...args) => {
    if (!hasRun) {
      hasRun = true;
      result = fn(...args);
    }
    return result;
  };
}

// Exercise 3
// WHY: a Map is the right cache. `has` correctly handles cached falsy values
// like 0 or ''. The miss counter sits in the same closure as the cache.
function memoizeWithStats(fn) {
  const cache = new Map();
  let misses = 0;
  return {
    call(input) {
      if (!cache.has(input)) {
        misses += 1;
        cache.set(input, fn(input));
      }
      return cache.get(input);
    },
    misses: () => misses,
  };
}

// Exercise 4
const report = {
  passed: 8,
  failed: 2,
  summary() {
    return `${this.passed} passed, ${this.failed} failed`;
  },
};

// WHY: bind() returns a new function whose `this` is locked to `report`.
// An arrow wrapper works just as well:  return () => report.summary();
function getReporter() {
  return report.summary.bind(report);
}
// An arrow wrapper works just as well: return () => report.summary();

// Exercise 5
// WHY: the arrow callback has no `this` of its own, so it uses the `this` of
// titles(), which is `suite` because we call suite.titles().
const suite = {
  name: 'cart',
  tests: ['add item', 'remove item'],
  titles() {
    return this.tests.map((title) => `${this.name} > ${title}`);
  },
};

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. File A's. Functions see the variables where they are DEFINED. This is
//       lexical (static) scope.
//   Q2. setTimeout calls `submit` without `loginPage.` in front, so `this` is
//       undefined and `this.page` throws a TypeError. Fix with an arrow
//       wrapper, () => loginPage.submit(), or loginPage.submit.bind(loginPage).
//   Q3. A closure from a factory (or a small class) created PER TEST. A
//       module-level `let` is shared by every test in the worker process
//       (Lesson 14), so tests start leaking state into each other. In
//       Playwright, a fixture (Lesson 23) creates that state for each test.
//   Q4. Arrow functions have no own `this`; they inherit it from the
//       surrounding code. As a method, the surrounding code is the module
//       (undefined). Inside a method, the surrounding code IS the method, so
//       the callback sees the object.
//   Q5. No. Module scope is private to the file. Only `var` or function
//       declarations in classic (non-module) scripts end up on globalThis.
//
// Review answers:
//   R1. Same input -> same output, and no side effects (no mutation, no I/O).
//       Tests just call it and compare the result; no setup or mocks needed.
//   R2. forEach always visits every item. Use for...of with break (or
//       find/some, which stop early on their own).
//   R3. `var` is function-scoped, so all callbacks share ONE `i`, which holds
//       the final value when they run. `let` creates a new binding per
//       iteration.
// ----------------------------------------------------------------------------

// ============================== TESTS ======================================
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
