/**
 * ============================================================================
 *  EXERCISES 01 — Variables & Constants
 * ============================================================================
 *  Run:  node course/javascript/01-variables-and-constants/exercises.js
 *
 *  How to work:
 *    1. Replace each `throw new Error('TODO')` with your solution.
 *    2. Run the file. Every test must pass (✔). Failing tests show what's wrong.
 *    3. Answer the self-check questions in your head or on paper.
 *    4. Only THEN compare with solutions.js.
 *
 *  Struggling a bit is good: it's how memory is built. Give each exercise at
 *  least 10 minutes before you peek.
 *
 *  Reading test output: each `test(...)` prints ✔ (passed) or ✖ (failed).
 *  For a failure, read the "expected" vs "actual" lines first, and the error
 *  message second. Ignore the long stack trace until you need it.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// ----------------------------------------------------------------------------
// Exercise 1 — Fix the classic loop bug
// Return an array of `count` functions. Calling the function at index i must
// return i. Example: makeCallbacks(3).map((fn) => fn())  ->  [0, 1, 2]
//
// This previews two later topics: arrow functions (Lesson 07) and closures,
// functions that remember variables (Lesson 10). You only need the pattern
// from lesson section 3:  for (let i = ...) { callbacks.push(() => i); }
// ----------------------------------------------------------------------------
function makeCallbacks(count) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 2 — Swap with destructuring
// Return the two values in swapped order, as an array: swap(1, 2) -> [2, 1].
// Rule: one line, no temporary variable.
// ----------------------------------------------------------------------------
function swap(first, second) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 3 — Update without mutating
// Return a NEW settings object with `timeout` replaced. The original object
// must stay untouched (it is frozen, so mutating it would throw anyway).
// Hint: the spread syntax from lesson section 5.
// ----------------------------------------------------------------------------
function withTimeout(settings, timeout) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 4 — Refactor let away
// This function works, but uses `let` and reassignment. Rewrite the body with
// no `let` and no reassignment. Tip: early returns are often the clearest
// option. Avoid nested ternaries (Lesson 05 explains why).
// The tests protect the behavior.
// ----------------------------------------------------------------------------
function describeDuration(ms) {
  let text;
  if (ms < 1_000) {
    text = 'fast';
  } else if (ms < 5_000) {
    text = 'ok';
  } else {
    text = 'slow';
  }
  return text;
}

// ----------------------------------------------------------------------------
// Exercise 5 (bonus) — Deep freeze
// Object.freeze is shallow. Write deepFreeze(object) that freezes the object
// and every nested object inside it, then returns it.
// Hint: Object.values(object) and typeof value === 'object'.
// ----------------------------------------------------------------------------
function deepFreeze(object) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.js)
//   Q1. Can you call .push() on an array declared with const? Why?
//   Q2. Spot the bug:
//         for (var i = 0; i < 3; i++) { buttons[i].onclick = () => select(i); }
//       Every button selects item 3. Why, and what is the one-word fix?
//   Q3. A colleague writes `let page = await browser.newPage();` and never
//       reassigns it. What would you suggest in review, and why does it matter?
//   Q4. Why should a boolean be named `isVisible` rather than `visible`?
//   Q5. A shared `const CONFIG = Object.freeze({ browser: { headless: true } })`
//       still gets changed by a test. How is that possible, and what are two
//       ways to prevent it?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
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
