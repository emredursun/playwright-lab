/**
 * ============================================================================
 *  EXERCISES 08 — Arrays
 * ============================================================================
 *  Run:  node course/javascript/08-arrays/exercises.js
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

// Sample data for the exercises:
const results = Object.freeze([
  { title: 'login', status: 'passed', durationMs: 1_200, tags: ['@smoke'] },
  { title: 'cart', status: 'failed', durationMs: 4_800, tags: ['@cart'] },
  { title: 'search', status: 'passed', durationMs: 900, tags: ['@smoke', '@search'] },
  { title: 'checkout', status: 'skipped', durationMs: 0, tags: ['@cart'] },
]);

// ----------------------------------------------------------------------------
// Exercise 1 — A readable chain
// Return the titles of PASSED tests, in UPPERCASE.
// Example (with the data above) -> ['LOGIN', 'SEARCH']
// Rule: a filter + map chain, no loops.
// ----------------------------------------------------------------------------
function passedTitles(testResults) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 2 — Sort without mutating
// Return the titles sorted from SLOWEST to fastest. The input array is frozen,
// so a mutating `.sort()` would throw.
// Example -> ['cart', 'login', 'search', 'checkout']
// ----------------------------------------------------------------------------
function slowestFirst(testResults) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 3 — Summary
// Return an object with:
//   total:      number of tests
//   totalMs:    sum of all durations (reduce with an initial value!)
//   hasFailure: true if at least one test failed (some)
//   lastTitle:  title of the last test (at)
// ----------------------------------------------------------------------------
function summarize(testResults) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 4 — Unique tags
// Return every tag used, without duplicates, sorted alphabetically.
// Example -> ['@cart', '@search', '@smoke']
// Hint: flatMap, then a Set (Lesson 15; [...new Set(list)] removes
// duplicates), then toSorted with localeCompare (Lesson 03).
// ----------------------------------------------------------------------------
function uniqueTags(testResults) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 5 (bonus) — Count by status
// Return an object mapping each status to how many tests have it.
// Example -> { passed: 2, failed: 1, skipped: 1 }
// Hint: Object.groupBy, then Object.entries + Object.fromEntries (a preview of
// Lesson 09), or a for...of loop over the groups (Lesson 06).
// ----------------------------------------------------------------------------
function countByStatus(testResults) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 6 — Filter with an async check
// Return the items for which `await predicate(item)` is true, in their
// original order. `predicate` is an ASYNC function, so a plain
// items.filter(predicate) keeps everything (lesson section 9).
// Hint: await Promise.all(items.map(predicate)) gives you the booleans.
// ----------------------------------------------------------------------------
async function filterAsync(items, predicate) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.js)
//   Q1. What does [900, 10000, 1200].sort() return, and why?
//   Q2. What's the difference between sort() and toSorted()?
//   Q3. Spot the bug:  function fastest(results) { return results.sort((a, b) => a.ms - b.ms)[0]; }
//       It returns the right test, but a report printed LATER shows the
//       results in the wrong order. Why, and what's the fix?
//   Q4. What happens if you call [].reduce((a, b) => a + b) without an initial value?
//   Q5. A test keeps only visible rows with
//         (await rows.all()).filter(async (row) => await row.isVisible())
//       and the count is always the total. Why, and what does Playwright
//       offer instead?
//
// Review (earlier lessons)
//   R1. (Lesson 07) What's wrong with ['10', '20'].map(parseInt)?
//   R2. (Lesson 06) When is a classic `for (let i = 0; ...)` loop still the
//       right choice?
//   R3. (Lesson 04) Why does a test compare money in cents instead of dollars?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
test('1. passedTitles: filter + map', () => {
  assert.deepEqual(passedTitles(results), ['LOGIN', 'SEARCH']);
  assert.deepEqual(passedTitles([]), []);
});

test('2. slowestFirst: sorted by duration, input untouched', () => {
  assert.deepEqual(slowestFirst(results), ['cart', 'login', 'search', 'checkout']);
  assert.equal(results[0].title, 'login');
});

test('3. summarize: total, totalMs, hasFailure, lastTitle', () => {
  assert.deepEqual(summarize(results), {
    total: 4,
    totalMs: 6_900,
    hasFailure: true,
    lastTitle: 'checkout',
  });
  assert.deepEqual(summarize([{ title: 'only', status: 'passed', durationMs: 5, tags: [] }]), {
    total: 1,
    totalMs: 5,
    hasFailure: false,
    lastTitle: 'only',
  });
});

test('4. uniqueTags: no duplicates, sorted', () => {
  assert.deepEqual(uniqueTags(results), ['@cart', '@search', '@smoke']);
});

test('5. countByStatus (bonus): counts per status', () => {
  assert.deepEqual(countByStatus(results), { passed: 2, failed: 1, skipped: 1 });
  assert.deepEqual(countByStatus([]), {});
});

test('6. filterAsync: awaits the predicate, keeps order', async () => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const isEvenSlowly = async (n) => {
    await delay(5 - n); // later items answer first: order must still be kept
    return n % 2 === 0;
  };
  assert.deepEqual(await filterAsync([1, 2, 3, 4], isEvenSlowly), [2, 4]);
  assert.deepEqual(await filterAsync([], isEvenSlowly), []);
});
