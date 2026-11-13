/**
 * ============================================================================
 *  EXERCISES 04 — Numbers & Math
 * ============================================================================
 *  Run:  node course/01-javascript/04-numbers-and-math/exercises.js
 *
 *  How to work:
 *    1. Replace each `throw new Error('TODO')` with your solution.
 *    2. Run the file. Every test must pass (✔). Failing tests show what's wrong.
 *    3. Answer the self-check and review questions in your head or on paper.
 *    4. Only THEN compare with solutions.js.
 *
 *  Struggling a bit is good: it's how memory is built. Give each exercise at
 *  least 10 minutes before you peek.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// ----------------------------------------------------------------------------
// Exercise 1 — Parse a price from UI text
// Input looks like '$1,234.50' or ' $19.99 ' (as read from a web page).
// Return the price as a number (1234.5, 19.99). Return null if the text
// doesn't contain a valid number.
// Hint: remove '$' and ',' with replaceAll (Lesson 03), then Number().
// ----------------------------------------------------------------------------
function parsePrice(text) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 2 — Cart total in cents
// Each item is { priceCents, quantity }. Return the total in CENTS (an
// integer). Then the formatted total: formatCents(5997) -> '$59.97'.
// Use Intl.NumberFormat — no manual '$' + ... building.
// Hint: summing an array (explained in Lesson 08):
//   items.reduce((sum, item) => sum + <value of item>, 0)
// A plain for...of loop with a `let sum` works too (Lesson 06).
// ----------------------------------------------------------------------------
function totalCents(items) {
  throw new Error('TODO');
}

function formatCents(cents) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 3 — Pass rate
// Return the pass rate as a percentage rounded to 1 decimal, as a NUMBER.
// passRate(2, 3) -> 66.7. If total is 0, return 0 (never divide by zero!).
// ----------------------------------------------------------------------------
function passRate(passed, total) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 4 — Dates for test data
// Return the date `days` days after `isoDate`, as 'YYYY-MM-DD'.
//   addDays('2026-11-13', 30) -> '2026-12-13'
//   addDays('2026-12-31', 1)  -> '2027-01-01'
// Work in UTC so the result never depends on the machine's time zone.
// Hint: new Date('2026-11-13') is UTC midnight; use getUTCDate/setUTCDate and
// toISOString().slice(0, 10).
// ----------------------------------------------------------------------------
function addDays(isoDate, days) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 5 (bonus) — Duration statistics
// Given an array of durations in ms, return { min, max, average } where
// average is rounded to the nearest integer. For an empty array return null.
// Hint: the sum uses the same reduce shape as Exercise 2.
// ----------------------------------------------------------------------------
function durationStats(durations) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.js)
//   Q1. Why is 0.1 + 0.2 === 0.3 false? How do you store money safely?
//   Q2. isNaN('abc') vs Number.isNaN('abc') — results and which one to use?
//   Q3. Spot the bug: const qty = Number(input.value); if (Number.isNaN(qty)) showError();
//       The user leaves the field empty and no error appears. Why?
//   Q4. A test asserts expect(total).toBe(0.3) after adding 0.1 and 0.2 and
//       fails. What should it use instead?
//   Q5. A test passes on your laptop and fails in CI with a date one day off.
//       Name two likely causes and how to make the test deterministic.
//
// Review (earlier lessons)
//   R1. (Lesson 02) Why does typeof null === 'object' matter when you check
//       an API response before reading its properties?
//   R2. (Lesson 03) Why should a regex built from a product name be escaped?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
test('1. parsePrice: reads prices from UI text', () => {
  assert.equal(parsePrice('$1,234.50'), 1234.5);
  assert.equal(parsePrice(' $19.99 '), 19.99);
  assert.equal(parsePrice('free'), null);
  assert.equal(parsePrice(''), null);
});

test('2. totalCents + formatCents: exact money math', () => {
  const items = [
    { priceCents: 1_999, quantity: 3 },
    { priceCents: 1, quantity: 10 },
  ];
  assert.equal(totalCents(items), 6_007);
  assert.equal(totalCents([]), 0);
  assert.equal(formatCents(6_007), '$60.07');
  assert.equal(formatCents(123_450), '$1,234.50');
});

test('3. passRate: rounded number, safe for zero', () => {
  assert.equal(passRate(2, 3), 66.7);
  assert.equal(passRate(10, 10), 100);
  assert.equal(passRate(0, 0), 0);
});

test('4. addDays: UTC date math across month and year ends', () => {
  assert.equal(addDays('2026-11-13', 30), '2026-12-13');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2026-02-28', 1), '2026-03-01');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
  assert.equal(addDays('2026-11-13', 0), '2026-11-13');
});

test('5. durationStats (bonus): min, max, rounded average', () => {
  assert.deepEqual(durationStats([100, 200, 400]), { min: 100, max: 400, average: 233 });
  assert.deepEqual(durationStats([50]), { min: 50, max: 50, average: 50 });
  assert.equal(durationStats([]), null);
});
