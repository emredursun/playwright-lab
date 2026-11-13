/**
 * ============================================================================
 *  SOLUTIONS 15 — Maps & Sets
 * ============================================================================
 *  Run:  node course/javascript/15-maps-and-sets/solutions.js
 *
 *  Compare these with YOUR solutions. If yours is different but the tests pass,
 *  it may be just as good. Read the WHY comments to see the trade-offs.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// Exercise 1
// WHY: a Map keeps the real key type (numbers stay numbers) and its order.
// `?? 0` supplies the starting count the first time a key appears.
function countBy(items, getKey) {
  const counts = new Map();
  for (const item of items) {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

// Exercise 2
// WHY: flatMap merges all tag arrays into one, the Set drops duplicates, and
// toSorted returns a NEW sorted array (no mutation).
function uniqueSortedTags(tests) {
  return [...new Set(tests.flatMap((test) => test.tags))].toSorted((a, b) => a.localeCompare(b));
}

// Exercise 3
// WHY: the Set methods say exactly what we mean: "in previous but not in
// current" is a difference. Readable, and no nested loops with includes().
function compareRuns(previous, current) {
  const before = new Set(previous);
  const now = new Set(current);
  return {
    fixed: [...before.difference(now)].toSorted((a, b) => a.localeCompare(b)),
    newFailures: [...now.difference(before)].toSorted((a, b) => a.localeCompare(b)),
    stillFailing: [...before.intersection(now)].toSorted((a, b) => a.localeCompare(b)),
  };
}

// Exercise 4
// WHY: JSON only knows objects and arrays. Convert at the boundary: Map ->
// object before saving, object -> Map after loading. (This works when the keys
// are strings. For other key types, save [...map], an array of pairs.)
function serializeMap(map) {
  return JSON.stringify(Object.fromEntries(map));
}

function deserializeMap(json) {
  return new Map(Object.entries(JSON.parse(json)));
}

// Exercise 5
// WHY: the WeakMap lives in the closure, so each wrapper has its own private
// cache. Its keys are held weakly: when a run object is no longer used
// anywhere, its cached entry can be garbage collected. No memory leak.
function memoizePerObject(fn) {
  const cache = new WeakMap();
  return (object) => {
    if (!cache.has(object)) {
      cache.set(object, fn(object));
    }
    return cache.get(object);
  };
}

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. Choose a Map when the keys only appear at runtime, when keys are not
//       strings, or when you add and remove entries often. A Map also gives
//       you .size and insertion order. Choose an object for a record with
//       fixed, known fields, and for data that goes to or from JSON.
//   Q2. JSON.stringify doesn't serialize Map entries, so a Map becomes {}.
//       Convert first: { results: Object.fromEntries(resultsMap) }.
//   Q3. nightly.intersection(pr): a NEW Set with only the names in both.
//   Q4. Objects are compared by reference, and these are two different
//       objects. Deduplicate by key with a Map:
//       [...new Map(items.map((item) => [item.id, item])).values()].
//   Q5. Map.groupBy(results, (result) => result.browser), or Object.groupBy
//       when string keys are enough.
//
// Review answers:
//   R1. A count of 0 is falsy, and inherited keys like 'constructor' are
//       truthy. Use Object.hasOwn(counts, key) or a Map with .has(key).
//   R2. In a variable captured by the returned function's closure. The
//       closure keeps that variable alive as long as the function exists.
//   R3. sort() mutates the original array; toSorted() returns a new one.
// ----------------------------------------------------------------------------

// ============================== TESTS ======================================
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
