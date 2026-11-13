/**
 * ============================================================================
 *  LESSON 15 — Maps & Sets
 * ============================================================================
 *  Run:       node course/javascript/15-maps-and-sets/lesson.js
 *  Practice:  node course/javascript/15-maps-and-sets/exercises.js
 *
 *  After this lesson you can:
 *    1. Decide between a plain object and a Map.
 *    2. Use the Map API, iterate it, and convert between Map and object.
 *    3. Count and group data with Map, Map.groupBy and Object.groupBy.
 *    4. Remove duplicates and compare collections with Set and its methods.
 *    5. Explain what WeakMap and WeakSet are for (caching per object).
 *
 *  How to study this file:
 *    - Every example has a numbered PREDICT comment. Write down your guess,
 *      run the file, then check the ANSWER KEY at the bottom.
 *    - Then close this file and solve exercises.js from memory.
 * ============================================================================
 */

const section = (title) => console.log(`\n--- ${title} ---`);

// ----------------------------------------------------------------------------
section('1. Why Map? Objects only have string keys');
// ----------------------------------------------------------------------------
// Mental model: an OBJECT describes one thing with known fields (a record).
// A MAP is a lookup table whose keys you only learn at runtime (a dictionary).

const userA = { id: 1 };
const userB = { id: 2 };

// AVOID: using objects as keys of a plain object. They are turned into strings!
const visitsObject = {};
visitsObject[userA] = 1;
visitsObject[userB] = 2;
console.log(Object.keys(visitsObject)); // PREDICT #1
console.log(visitsObject[userA]); // PREDICT #2

// PREFER: a Map accepts ANY value as a key: objects, numbers, even functions.
const visits = new Map();
visits.set(userA, 1).set(userB, 2); // set() returns the map, so calls chain
console.log(visits.get(userA), visits.size); // PREDICT #3

// Plain objects also inherit keys you never added:
const emptyObject = {};
console.log('constructor' in emptyObject); // PREDICT #4
console.log(new Map().has('constructor')); // PREDICT #5

// ----------------------------------------------------------------------------
section('2. The Map API');
// ----------------------------------------------------------------------------
// Create a Map from [key, value] pairs:
const statusByTest = new Map([
  ['login', 'passed'],
  ['checkout', 'failed'],
]);

statusByTest.set('search', 'skipped'); // add or overwrite
console.log(statusByTest.get('checkout')); // PREDICT #6
console.log(statusByTest.get('missing') ?? 'unknown'); // PREDICT #7
console.log(statusByTest.has('login')); // PREDICT #8
console.log(statusByTest.delete('search')); // PREDICT #9
console.log(statusByTest.size); // PREDICT #10

// ----------------------------------------------------------------------------
section('3. Iterating and ordering');
// ----------------------------------------------------------------------------
// A Map is iterable: for...of gives [key, value] pairs, which we destructure.
for (const [testName, status] of statusByTest) {
  console.log(`${testName}: ${status}`);
}
// PREDICT #11

console.log([...statusByTest.keys()]); // PREDICT #12
console.log([...statusByTest.values()]); // PREDICT #13

// Maps ALWAYS keep insertion order. Objects move integer-like keys to the front:
const objectOrder = { b: 1, 2: 1, a: 1, 1: 1 };
console.log(Object.keys(objectOrder)); // PREDICT #14

const mapOrder = new Map([
  ['b', 1],
  [2, 1],
  ['a', 1],
  [1, 1],
]);
console.log([...mapOrder.keys()]); // PREDICT #15

// ----------------------------------------------------------------------------
section('4. Converting between Map and object (and JSON)');
// ----------------------------------------------------------------------------
// Map -> object: Object.fromEntries accepts any iterable of [key, value] pairs.
const statusObject = Object.fromEntries(statusByTest);
console.log(statusObject); // PREDICT #16

// Watch out: JSON.stringify does NOT understand Maps.
console.log(JSON.stringify(statusByTest)); // PREDICT #17
console.log(JSON.stringify(statusObject)); // PREDICT #18

// object -> Map: Object.entries gives the [key, value] pairs.
const timeouts = { chromium: 30_000, firefox: 45_000 };
const timeoutByBrowser = new Map(Object.entries(timeouts));
console.log(timeoutByBrowser.get('firefox')); // PREDICT #19

// Transform a Map: go to pairs, map them, build a new Map (no mutation).
const doubledTimeouts = new Map([...timeoutByBrowser].map(([browser, ms]) => [browser, ms * 2]));
console.log(Object.fromEntries(doubledTimeouts)); // PREDICT #20

// ----------------------------------------------------------------------------
section('5. Counting pattern');
// ----------------------------------------------------------------------------
const results = ['passed', 'failed', 'passed', 'skipped', 'passed'];

const countByStatus = new Map();
for (const status of results) {
  countByStatus.set(status, (countByStatus.get(status) ?? 0) + 1);
}
console.log(countByStatus); // PREDICT #21

// `?? 0` gives a starting value the first time we see a key (Lesson 02).

// ----------------------------------------------------------------------------
section('6. Grouping: Map.groupBy and Object.groupBy');
// ----------------------------------------------------------------------------
const runs = [
  { title: 'login', browser: 'chromium', durationMs: 900 },
  { title: 'login', browser: 'firefox', durationMs: 1_400 },
  { title: 'checkout', browser: 'chromium', durationMs: 2_100 },
];

// AVOID (outdated): a hand-written reduce() that builds the groups manually.
// PREFER: the built-in groupBy functions (ES2024).
const runsByBrowser = Map.groupBy(runs, (run) => run.browser);
console.log([...runsByBrowser.keys()]); // PREDICT #22
console.log(runsByBrowser.get('chromium').map((run) => run.title)); // PREDICT #23

// Object.groupBy is the same idea, but the result is an object (string keys only).
const runsBySpeed = Object.groupBy(runs, (run) => (run.durationMs > 1_000 ? 'slow' : 'fast'));
console.log(Object.keys(runsBySpeed)); // PREDICT #24
console.log(runsBySpeed.slow.length); // PREDICT #25

// ----------------------------------------------------------------------------
section('7. Set: a collection of unique values');
// ----------------------------------------------------------------------------
const tags = ['@smoke', '@login', '@smoke', '@regression', '@login'];

// AVOID: tags.filter((tag, index) => tags.indexOf(tag) === index)  (slow and cryptic)
// PREFER:
const uniqueTags = [...new Set(tags)];
console.log(uniqueTags); // PREDICT #26

const tagSet = new Set(tags);
tagSet.add('@smoke'); // adding a duplicate does nothing
console.log(tagSet.size, tagSet.has('@login')); // PREDICT #27
// set.has() is fast even for huge sets. array.includes() checks items one by one.

// Objects are compared by REFERENCE, not by content:
console.log(new Set([{ id: 1 }, { id: 1 }]).size); // PREDICT #28

// ----------------------------------------------------------------------------
section('8. Set methods: compare two collections');
// ----------------------------------------------------------------------------
// Names of failing tests on two days:
const failedYesterday = new Set(['login', 'checkout', 'search']);
const failedToday = new Set(['checkout', 'profile']);

console.log([...failedYesterday.intersection(failedToday)]); // PREDICT #29
console.log([...failedYesterday.difference(failedToday)]); // PREDICT #30
console.log([...failedToday.difference(failedYesterday)]); // PREDICT #31
console.log([...failedYesterday.union(failedToday)]); // PREDICT #32
console.log([...failedYesterday.symmetricDifference(failedToday)]); // PREDICT #33

console.log(new Set(['checkout']).isSubsetOf(failedYesterday)); // PREDICT #34
console.log(failedToday.isDisjointFrom(new Set(['cart']))); // PREDICT #35

// ----------------------------------------------------------------------------
section('9. WeakMap and WeakSet: data attached to objects (optional: recognize only)');
// ----------------------------------------------------------------------------
// OPTIONAL: rare in test code. Learn to RECOGNIZE it in libraries; skip it if
// you're short on time.
// A WeakMap holds its keys "weakly": when nothing else uses a key object, the
// entry disappears automatically. That makes it ideal for caching per object.
const summaryCache = new WeakMap();
let computeCount = 0;

function getSummary(run) {
  if (summaryCache.has(run)) {
    return summaryCache.get(run);
  }
  computeCount += 1;
  const summary = `${run.passed}/${run.total} passed`;
  summaryCache.set(run, summary);
  return summary;
}

const nightlyRun = { passed: 9, total: 10 };
getSummary(nightlyRun);
getSummary(nightlyRun);
console.log(getSummary(nightlyRun), computeCount); // PREDICT #36

// Keys must be objects. Weak collections can't be iterated and have no size.
try {
  summaryCache.set('nightly', 'x');
} catch (error) {
  console.log(error.name); // PREDICT #37
}

// WeakSet: remember WHICH objects you've already handled.
const processed = new WeakSet();
processed.add(nightlyRun);
console.log(processed.has(nightlyRun), processed.has({ passed: 9, total: 10 })); // PREDICT #38

console.log('\nDone. Now open exercises.js and practice from memory!');

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - Object = a record with known fields. Map = a lookup table with runtime
 *      keys (any type, insertion order, a .size property, no inherited keys).
 *    - Map -> object: Object.fromEntries(map). Object -> Map:
 *      new Map(Object.entries(obj)). JSON.stringify(map) gives "{}".
 *    - Count with map.set(key, (map.get(key) ?? 0) + 1). Group with Map.groupBy.
 *    - Set = unique values: [...new Set(array)]. Compare sets with
 *      union, intersection, difference, isSubsetOf.
 *    - WeakMap/WeakSet attach data to objects without keeping them alive.
 *
 *  In Playwright:
 *    const failedTitles = new Set(results.filter(isFailed).map((r) => r.title));
 *    const resultsByProject = Map.groupBy(results, (r) => r.projectName);
 *    // A Map from user role to a saved login (storageState) file:
 *    const authFileByRole = new Map([['admin', 'playwright/.auth/admin.json']]);
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1   [ '[object Object]' ]
 *   #2   2  (userB overwrote userA!)
 *   #3   1 2
 *   #4   true
 *   #5   false
 *   #6   failed
 *   #7   unknown
 *   #8   true
 *   #9   true  (it existed)
 *   #10  2  (a property, not .length)
 *   #11  login: passed
 *        checkout: failed
 *   #12  [ 'login', 'checkout' ]
 *   #13  [ 'passed', 'failed' ]
 *   #14  [ '1', '2', 'b', 'a' ]
 *   #15  [ 'b', 2, 'a', 1 ]  (numbers stay numbers)
 *   #16  { login: 'passed', checkout: 'failed' }
 *   #17  {}
 *   #18  {"login":"passed","checkout":"failed"}
 *   #19  45000
 *   #20  { chromium: 60000, firefox: 90000 }
 *   #21  Map(3) { 'passed' => 3, 'failed' => 1, 'skipped' => 1 }
 *   #22  [ 'chromium', 'firefox' ]
 *   #23  [ 'login', 'checkout' ]
 *   #24  [ 'fast', 'slow' ]
 *   #25  2
 *   #26  [ '@smoke', '@login', '@regression' ]
 *   #27  3 true
 *   #28  2
 *   #29  [ 'checkout' ]  (still failing)
 *   #30  [ 'login', 'search' ]  (fixed)
 *   #31  [ 'profile' ]  (newly broken)
 *   #32  [ 'login', 'checkout', 'search', 'profile' ]
 *   #33  [ 'login', 'search', 'profile' ]
 *   #34  true
 *   #35  true  (nothing in common)
 *   #36  9/10 passed 1
 *   #37  TypeError
 *   #38  true false
 * ============================================================================
 */
