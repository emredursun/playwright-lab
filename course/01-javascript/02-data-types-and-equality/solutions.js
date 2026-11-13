/**
 * ============================================================================
 *  SOLUTIONS 02 — Data Types & Equality
 * ============================================================================
 *  Run:  node course/01-javascript/02-data-types-and-equality/solutions.js
 *
 *  Compare these with YOUR solutions. If yours is different but the tests pass,
 *  it may be just as good. Read the WHY comments to see the trade-offs.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// Exercise 1
// WHY: typeof is right for everything EXCEPT null (the 1995 quirk) and arrays
// (which are objects). Handle those two first with precise checks.
function getType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

// Exercise 2
// WHY: ?? only falls back on null/undefined, so a deliberate 0 survives.
// `options.retries || 2` would turn 0 into 2 — a classic bug.
function getRetries(options) {
  return options.retries ?? 2;
}

// Exercise 3
// WHY: ?. stops at the first null/undefined and returns undefined;
// ?? then supplies the fallback. One readable line instead of an && chain.
function getEmail(response) {
  return response?.data?.user?.email ?? 'unknown';
}

// Exercise 4
// WHY: we check each "empty" shape explicitly instead of relying on
// truthiness, because 0 and false are falsy but NOT empty.
// LIMIT: the last check treats ANY object with no own keys as empty, so
// new Date(), new Map([[1, 2]]) and new Set([1]) would return true. That's
// why the exercise is scoped to plain objects. A stricter version checks
// Object.getPrototypeOf(value) === Object.prototype first.
function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

// Exercise 5
// WHY: structuredClone copies every level, so changing the copy is safe and
// every nested object (including `args`) is new, as the exercise asked.
// ALTERNATIVE: nested spread copies only the path you change:
//   return { ...config, browser: { ...config.browser, headless: false } };
// Here `args` stays SHARED with the original. That's fine and common in
// immutable code (nothing mutates it), and cheaper for big objects, but it
// would fail this exercise's "every nested object is new" rule.
function withHeadedBrowser(config) {
  const copy = structuredClone(config);
  copy.browser.headless = false;
  return copy;
}

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. body === null: typeof null is 'object', so the check passes and
//       null.id throws a TypeError. Fix: also check body !== null, or use
//       optional chaining: response.body?.id.
//   Q2. '' == 0 is true (coercion), '' === 0 is false. Always use ===.
//   Q3. `data.items || []` is fine (an array is never falsy unless missing).
//       `data.page || 1` turns a valid page 0 into 1. Use ?? instead.
//   Q4. They differ for falsy but valid values like 0: || gives 5000, ?? keeps
//       0. || is the better choice when an empty string should ALSO fall back,
//       e.g. environment variables: process.env.BASE_URL || 'http://...'.
//   Q5. toBe compares by REFERENCE (Object.is): the function created a new
//       object, so it is a different box. Use toEqual to compare contents.
// ----------------------------------------------------------------------------

// ============================== TESTS ======================================
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
