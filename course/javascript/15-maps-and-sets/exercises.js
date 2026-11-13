/**
 * ============================================================================
 *  EXERCISES 15 — Maps & Sets
 * ============================================================================
 *  Run:  node course/javascript/15-maps-and-sets/exercises.js
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
// Exercise 1 — Count by key
// Return a Map from key to how many items produced that key.
// getKey is a function that receives an item and returns its key.
// Example: countBy(['a', 'bb', 'cc'], (word) => word.length)  ->  Map { 1 => 1, 2 => 2 }
// ----------------------------------------------------------------------------
function countBy(items, getKey) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 2 — Unique tags
// Each test has a `tags` array. Return every tag ONCE, sorted alphabetically.
// Hint: flatMap (Lesson 08) + Set + toSorted.
// ----------------------------------------------------------------------------
function uniqueSortedTags(tests) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 3 — Compare two test runs
// `previous` and `current` are arrays of FAILING test titles.
// Return { fixed, newFailures, stillFailing }, each a sorted array:
//   fixed:        failed before, not anymore
//   newFailures:  failing now, didn't fail before
//   stillFailing: failing in both runs
// Hint: Set methods.
// ----------------------------------------------------------------------------
function compareRuns(previous, current) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 4 — Save and load a Map as JSON
// JSON.stringify(map) gives '{}'. Make it work:
//   serializeMap(map)    -> a JSON string of an object with the same entries
//   deserializeMap(json) -> a new Map with the same entries
// ----------------------------------------------------------------------------
function serializeMap(map) {
  throw new Error('TODO');
}

function deserializeMap(json) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 5 (bonus, optional topic) — Cache results per object
// Return a wrapper around `fn` (which takes ONE object argument). The first
// call for an object runs fn. Later calls with the SAME object return the
// cached result without calling fn again. Different objects get their own result.
// Hint: WeakMap + a closure (Lesson 10).
// ----------------------------------------------------------------------------
function memoizePerObject(fn) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.js)
//   Q1. When do you choose a Map over a plain object? When is an object better?
//   Q2. Your report helper does `JSON.stringify({ results: resultsMap })` and
//       the saved file shows "results": {}. Why, and how do you fix it?
//   Q3. You want to know which tests failed in BOTH the nightly and the PR
//       run. Which Set method do you use, and what does it return?
//   Q4. Two tests each create `{ id: 1 }` and add it to the same Set. Why is
//       the size 2, and how would you deduplicate by id instead?
//   Q5. You get an array of results with a `browser` field and need them per
//       browser. What do you write instead of a hand-made reduce()?
//
// Review (earlier lessons):
//   R1. (Lesson 09) Why is `if (counts[key])` a risky way to check a plain
//       object used as a dictionary?
//   R2. (Lesson 10) In a memoize helper, where does the cache live, and why
//       does it survive between calls?
//   R3. (Lesson 08) toSorted() vs sort(): which one changes the original?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
test('1. countBy: counts items per key', () => {
  const byLength = countBy(['a', 'bb', 'cc'], (word) => word.length);
  assert.ok(byLength instanceof Map, 'return a Map');
  assert.deepEqual(
    [...byLength],
    [
      [1, 1],
      [2, 2],
    ],
  );
  assert.equal(countBy([], (item) => item).size, 0);
});

test('2. uniqueSortedTags: each tag once, sorted', () => {
  const tests = [
    { title: 'login', tags: ['@smoke', '@auth'] },
    { title: 'logout', tags: ['@auth'] },
    { title: 'checkout', tags: ['@regression', '@smoke'] },
  ];
  assert.deepEqual(uniqueSortedTags(tests), ['@auth', '@regression', '@smoke']);
  assert.deepEqual(uniqueSortedTags([]), []);
});

test('3. compareRuns: fixed, new and still failing tests', () => {
  const report = compareRuns(['search', 'login', 'checkout'], ['profile', 'checkout']);
  assert.deepEqual(report, {
    fixed: ['login', 'search'],
    newFailures: ['profile'],
    stillFailing: ['checkout'],
  });
});

test('4. serializeMap / deserializeMap: a Map survives a JSON round trip', () => {
  const original = new Map([
    ['chromium', 30_000],
    ['firefox', 45_000],
  ]);
  const json = serializeMap(original);
  assert.equal(json, '{"chromium":30000,"firefox":45000}');
  const restored = deserializeMap(json);
  assert.ok(restored instanceof Map, 'return a Map');
  assert.deepEqual([...restored], [...original]);
});

test('5. memoizePerObject (bonus): one call per object', () => {
  let calls = 0;
  const describe = memoizePerObject((run) => {
    calls += 1;
    return `${run.passed}/${run.total}`;
  });
  const first = { passed: 9, total: 10 };
  const second = { passed: 9, total: 10 };
  assert.equal(describe(first), '9/10');
  assert.equal(describe(first), '9/10');
  assert.equal(calls, 1, 'same object -> cached');
  assert.equal(describe(second), '9/10');
  assert.equal(calls, 2, 'different object -> computed again');
});
