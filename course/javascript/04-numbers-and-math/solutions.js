/**
 * ============================================================================
 *  SOLUTIONS 04 — Numbers & Math
 * ============================================================================
 *  Run:  node course/javascript/04-numbers-and-math/solutions.js
 *
 *  Compare these with YOUR solutions. If yours is different but the tests pass,
 *  it may be just as good. Read the WHY comments to see the trade-offs.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// Exercise 1
// WHY: clean the text first, then use the STRICT Number(). The empty-string
// check matters because Number('') is 0, not NaN. Number.isFinite rejects
// NaN in the same check.
function parsePrice(text) {
  const cleaned = text.replaceAll('$', '').replaceAll(',', '').trim();
  const value = Number(cleaned);
  return cleaned !== '' && Number.isFinite(value) ? value : null;
}

// Exercise 2
// WHY: integer cents never suffer from floating point errors. reduce walks
// the array and carries a running total, starting at 0 (Lesson 08). Create the
// formatter ONCE (outside the function) and reuse it — it's relatively costly
// to build.
const usdFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function totalCents(items) {
  return items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
}

function formatCents(cents) {
  return usdFormatter.format(cents / 100);
}

// Exercise 3
// WHY: guard clause first (Lesson 05 goes deeper), then round with the
// "multiply, round, divide" trick so the result stays a NUMBER. toFixed would
// return a string.
function passRate(passed, total) {
  if (total === 0) return 0;
  return Math.round((passed / total) * 1_000) / 10;
}

// Exercise 4
// WHY: a date-only ISO string is parsed as UTC midnight, and the UTC methods
// never look at the local time zone, so the result is the same on every
// machine. setUTCDate handles month and year rollover for us (that's the
// "February 30 -> March 2" behavior from the lesson, used on purpose).
// AVOID adding days * 24 * 60 * 60 * 1000 with local dates: daylight saving
// time makes some days 23 or 25 hours long.
function addDays(isoDate, days) {
  const date = new Date(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Exercise 5
// WHY: handle the empty case first; Math.max() of nothing is -Infinity.
// Spread passes the array items as separate arguments. (For huge arrays,
// reduce is safer than spread, which has an argument limit.)
function durationStats(durations) {
  if (durations.length === 0) return null;
  const sum = durations.reduce((total, ms) => total + ms, 0);
  return {
    min: Math.min(...durations),
    max: Math.max(...durations),
    average: Math.round(sum / durations.length),
  };
}

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. 0.1 and 0.2 can't be stored exactly in binary, so their sum is
//       0.30000000000000004. Store money as integer cents and format at the
//       end.
//   Q2. isNaN('abc') is true (it converts first, misleading).
//       Number.isNaN('abc') is false (it's a string, not NaN). Use
//       Number.isNaN.
//   Q3. Number('') is 0, not NaN, so the check passes. Check for an empty
//       (trimmed) string first, or use a validating parser like parseCount
//       from the lesson.
//   Q4. A tolerance: expect(total).toBeCloseTo(0.3) (or compute in integers,
//       e.g. cents). toBe uses exact equality.
//   Q5. Time zones (the CI machine runs in UTC, your laptop doesn't) and local
//       date parsing (new Date('2026-11-13T09:30') without 'Z'). Also "now"
//       changing during the run, e.g. around midnight. Fix: build dates in UTC
//       (Date.UTC, ISO strings with Z), pass an explicit timeZone to Intl, and
//       in Playwright set timezoneId and freeze time with page.clock.
//
// Review answers
//   R1. A response body of null passes `typeof body === 'object'`, and then
//       body.id throws. Check body !== null, or read it with body?.id.
//   R2. Product names can contain regex characters like ( ) . ? +. Unescaped,
//       they change the meaning of the pattern and the assertion fails (or
//       worse, passes for the wrong text).
// ----------------------------------------------------------------------------

// ============================== TESTS ======================================
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
