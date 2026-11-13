/**
 * ============================================================================
 *  SOLUTIONS 01 — Variables & Constants
 * ============================================================================
 *  Run:  node course/01-javascript/01-variables-and-constants/solutions.js
 *
 *  Compare these with YOUR solutions. If yours is different but the tests pass,
 *  it may be just as good. Read the WHY comments to see the trade-offs.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// Exercise 1
// WHY: `let` in a for-loop creates a fresh binding per iteration, so every
// arrow function captures its own `i`. With `var` they would all share one.
// The loop version is perfectly fine:
//   const callbacks = [];
//   for (let i = 0; i < count; i++) callbacks.push(() => i);
//   return callbacks;
// Array.from builds the same array without a manual loop (Lesson 08):
function makeCallbacks(count) {
  return Array.from({ length: count }, (_, index) => () => index);
}

// Exercise 2
// WHY: array destructuring/literals express "swap" in one readable step.
function swap(first, second) {
  return [second, first];
}

// Exercise 3
// WHY: the spread operator copies every property into a NEW object, and the
// property listed after it overrides the copied value. No mutation needed.
function withTimeout(settings, timeout) {
  return { ...settings, timeout };
}

// Exercise 4
// WHY: early returns remove the "half-initialized" `let text;` state and read
// top to bottom like a decision table. Each branch ends the function, so no
// reassignment is possible. A nested ternary would also avoid `let`, but it is
// harder to read and to extend (Lesson 05: never nest ternaries).
function describeDuration(ms) {
  if (ms < 1_000) return 'fast';
  if (ms < 5_000) return 'ok';
  return 'slow';
}

// Exercise 5
// WHY: freeze recursively. `value !== null` matters because typeof null is
// 'object' (a famous JavaScript quirk you'll meet in Lesson 02).
function deepFreeze(object) {
  for (const value of Object.values(object)) {
    if (typeof value === 'object' && value !== null) {
      deepFreeze(value);
    }
  }
  return Object.freeze(object);
}

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. Yes. `const` only stops REASSIGNING the name. The array itself can
//       still change.
//   Q2. `var i` is ONE variable shared by all handlers. When a button is
//       clicked, the loop has long finished and i is 3. Fix: `let i`, which
//       gives each iteration (and each handler) its own `i`.
//   Q3. Suggest `const`. It tells every reader "this never points at another
//       page", so nobody has to scan the rest of the test for reassignments,
//       and an accidental `page = ...` becomes an error instead of a bug.
//   Q4. A name like `isVisible` reads as a yes/no question, so
//       `if (isVisible)` reads like a sentence. `visible` could just as well
//       be an element or a count.
//   Q5. Object.freeze is shallow: CONFIG.browser.headless can still be
//       changed. Prevent it with a deep freeze (Exercise 5), or better, never
//       mutate shared config: create a copy with spread
//       ({ ...CONFIG, browser: { ...CONFIG.browser, headless: false } }).
// ----------------------------------------------------------------------------

// ============================== TESTS ======================================
const sourceOf = (fn) => fn.toString().replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');

test('1. makeCallbacks: each callback remembers its own index', () => {
  assert.deepEqual(
    makeCallbacks(3).map((fn) => fn()),
    [0, 1, 2],
  );
  assert.deepEqual(makeCallbacks(0), []);
});

test('2. swap: returns values in swapped order', () => {
  assert.deepEqual(swap(1, 2), [2, 1]);
  assert.deepEqual(swap('a', 'b'), ['b', 'a']);
});

test('3. withTimeout: returns a new object and keeps the original', () => {
  const original = Object.freeze({ timeout: 30_000, headless: true });
  const updated = withTimeout(original, 5_000);
  assert.deepEqual(updated, { timeout: 5_000, headless: true });
  assert.equal(original.timeout, 30_000);
  assert.notEqual(updated, original);
});

test('4. describeDuration: no let (and still works)', () => {
  assert.equal(describeDuration(500), 'fast');
  assert.equal(describeDuration(1_000), 'ok');
  assert.equal(describeDuration(4_999), 'ok');
  assert.equal(describeDuration(5_000), 'slow');
  assert.doesNotMatch(sourceOf(describeDuration), /\blet\b/, 'remove `let` from the function');
});

test('5. deepFreeze (bonus): nested objects are frozen too', () => {
  const frozen = deepFreeze({ browser: { launch: { headless: true } }, tags: ['@smoke'] });
  assert.ok(Object.isFrozen(frozen));
  assert.ok(Object.isFrozen(frozen.browser));
  assert.ok(Object.isFrozen(frozen.browser.launch));
  assert.ok(Object.isFrozen(frozen.tags));
});
