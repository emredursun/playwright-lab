/**
 * ============================================================================
 *  SOLUTIONS 08 — Arrays
 * ============================================================================
 *  Run:  node course/01-javascript/08-arrays/solutions.js
 *
 *  Compare these with YOUR solutions. If yours is different but the tests pass,
 *  it may be just as good. Read the WHY comments to see the trade-offs.
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

// Exercise 1
// WHY: filter first (fewer items to transform), then map. Each line does one
// thing, so the chain reads like a sentence.
function passedTitles(testResults) {
  return testResults
    .filter((result) => result.status === 'passed')
    .map((result) => result.title.toUpperCase());
}

// Exercise 2
// WHY: toSorted returns a NEW array, so the frozen input is never touched.
// b - a sorts numbers descending; without a comparator they'd sort as strings.
function slowestFirst(testResults) {
  return testResults.toSorted((a, b) => b.durationMs - a.durationMs).map((result) => result.title);
}

// Exercise 3
// WHY: each property uses the method that matches its question. The initial
// value 0 keeps reduce safe on empty arrays. Shorthand property names
// (Lesson 09) avoid repeating `total: total`.
function summarize(testResults) {
  const total = testResults.length;
  const totalMs = testResults.reduce((sum, result) => sum + result.durationMs, 0);
  const hasFailure = testResults.some((result) => result.status === 'failed');
  const lastTitle = testResults.at(-1)?.title;
  return { total, totalMs, hasFailure, lastTitle };
}

// Exercise 4
// WHY: flatMap merges all tag arrays into one list, a Set drops duplicates,
// and spreading the Set back into an array gives us toSorted. localeCompare
// sorts like a human ('@Cart' and '@cart' end up together); a comparator-less
// sort only works here by luck because all tags are lowercase ASCII.
function uniqueTags(testResults) {
  const tags = testResults.flatMap((result) => result.tags);
  return [...new Set(tags)].toSorted((a, b) => a.localeCompare(b));
}

// Exercise 5
// WHY: Object.groupBy does the grouping. Object.entries turns the groups into
// [status, items] pairs that we map to [status, count], and fromEntries
// rebuilds an object from those pairs.
function countByStatus(testResults) {
  const groups = Object.groupBy(testResults, (result) => result.status);
  return Object.fromEntries(
    Object.entries(groups).map(([status, items]) => [status, items.length]),
  );
}

// Exercise 6
// WHY: Promise.all runs every check in parallel and returns the booleans in
// the SAME order as the input, no matter which check finishes first. Then a
// normal, synchronous filter uses them by index. For checks that must run one
// at a time, use for...of + await instead (Lesson 06).
async function filterAsync(items, predicate) {
  const keep = await Promise.all(items.map(predicate));
  return items.filter((_, index) => keep[index]);
}

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. [10000, 1200, 900]. Without a comparator, sort converts the items to
//       strings and compares them character by character ('1' comes before
//       '9').
//   Q2. sort() changes the original array (and returns it). toSorted()
//       returns a sorted copy and leaves the original alone.
//   Q3. sort() MUTATES the caller's array, so everyone sharing it now sees
//       it reordered. Use results.toSorted(...)[0], or better, a single pass
//       that doesn't sort at all (reduce, or Math.min over the durations).
//   Q4. It throws a TypeError ("Reduce of empty array with no initial
//       value"). Always pass an initial value.
//   Q5. filter never awaits: every async callback returns a Promise, which
//       is truthy, so every row is kept. Use the built-in locator filters,
//       which auto-wait: rows.filter({ visible: true }) or
//       rows.filter({ hasText: 'Paid' }), then assert with toHaveCount.
//
// Review answers
//   R1. map passes (item, index), so parseInt gets the index as the radix:
//       ['10', '20'].map(parseInt) is [10, NaN]. Use map(Number).
//   R2. When you need control over the index itself: stepping by 2, walking
//       backwards, or comparing neighbors (items[i] vs items[i + 1]).
//   R3. Decimals like 0.1 + 0.2 aren't exact in floating point. Integer cents
//       are exact, so equality checks are reliable.
// ----------------------------------------------------------------------------

// ============================== TESTS ======================================
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
