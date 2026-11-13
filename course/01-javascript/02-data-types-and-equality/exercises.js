/**
 * ============================================================================
 *  EXERCISES 02 — Data Types & Equality
 * ============================================================================
 *  Run:  node course/01-javascript/02-data-types-and-equality/exercises.js
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
// Exercise 1 — A better typeof
// Return a precise type name: 'null', 'array', or whatever typeof returns.
// Examples: getType(null) -> 'null', getType([]) -> 'array', getType(1) -> 'number'
// ----------------------------------------------------------------------------
function getType(value) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 2 — Safe defaults
// Return the retry count from `options`, or 2 if it is missing (null/undefined).
// 0 is a VALID value and must be kept.
// ----------------------------------------------------------------------------
function getRetries(options) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 3 — Read nested data safely
// Return response.data.user.email, or 'unknown' if any part of the path is
// missing. Also `response` itself may be undefined.
// ----------------------------------------------------------------------------
function getEmail(response) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 4 — Is it empty?
// Return true only for: null, undefined, '' (after trimming spaces), [] and {}.
// Return false for everything else — including 0 and false (they are values!).
// Scope: objects here are PLAIN objects ({...}); you don't need to handle
// Date, Map or Set.
// ----------------------------------------------------------------------------
function isEmpty(value) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 5 (bonus) — Copy without side effects
// Return a deep copy of `config` with `config.browser.headless` set to false.
// The original (and its nested objects) must not change, and EVERY nested
// object in the result, including the `args` array, must be a new copy.
// Use `const` only (Lesson 01).
// ----------------------------------------------------------------------------
function withHeadedBrowser(config) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.js)
//   Q1. Spot the bug:  if (typeof response.body === 'object') { use(response.body.id) }
//       It crashes for one specific body value. Which one, and what's the fix?
//   Q2. What is the result of '' == 0? And '' === 0? Which one should you use?
//   Q3. Spot the bug:  const items = data.items || [];  const page = data.page || 1;
//       Which line is fine and which one hides a bug when the API sends 0?
//   Q4. options.timeout || 5000 vs options.timeout ?? 5000 — when do they differ,
//       and when is || actually the better choice?
//   Q5. A test does expect(createUser()).toBe({ id: 1 }) and fails although the
//       object looks identical. Why, and which matcher should it use?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
test('1. getType: precise type names', () => {
  assert.equal(getType(null), 'null');
  assert.equal(getType([1, 2]), 'array');
  assert.equal(getType({}), 'object');
  assert.equal(getType('a'), 'string');
  assert.equal(getType(1), 'number');
  assert.equal(getType(undefined), 'undefined');
  assert.equal(
    getType(() => {}),
    'function',
  );
});

test('2. getRetries: keeps 0, defaults only for null/undefined', () => {
  assert.equal(getRetries({ retries: 0 }), 0);
  assert.equal(getRetries({ retries: 5 }), 5);
  assert.equal(getRetries({ retries: null }), 2);
  assert.equal(getRetries({}), 2);
});

test('3. getEmail: never crashes on missing data', () => {
  assert.equal(getEmail({ data: { user: { email: 'ada@test.dev' } } }), 'ada@test.dev');
  assert.equal(getEmail({ data: {} }), 'unknown');
  assert.equal(getEmail({}), 'unknown');
  assert.equal(getEmail(undefined), 'unknown');
});

test('4. isEmpty: empty values vs real values', () => {
  for (const value of [null, undefined, '', '   ', [], {}]) {
    assert.equal(isEmpty(value), true, `expected ${JSON.stringify(value)} to be empty`);
  }
  for (const value of [0, false, 'a', [0], { a: 1 }]) {
    assert.equal(isEmpty(value), false, `expected ${JSON.stringify(value)} NOT to be empty`);
  }
});

test('5. withHeadedBrowser (bonus): deep copy, original untouched', () => {
  const config = { name: 'ci', browser: { headless: true, args: ['--no-sandbox'] } };
  const result = withHeadedBrowser(config);
  assert.equal(result.browser.headless, false);
  assert.equal(config.browser.headless, true);
  assert.notEqual(result.browser, config.browser);
  assert.notEqual(result.browser.args, config.browser.args);
  assert.deepEqual(result.browser.args, ['--no-sandbox']);
});
