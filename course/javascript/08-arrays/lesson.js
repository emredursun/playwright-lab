/**
 * ============================================================================
 *  LESSON 08 — Arrays
 * ============================================================================
 *  Run:       node course/javascript/08-arrays/lesson.js
 *  Practice:  node course/javascript/08-arrays/exercises.js
 *
 *  After this lesson you can:
 *    1. Create arrays with literals and Array.from.
 *    2. Transform and search with map, filter, find, some, every, includes...
 *    3. Write readable method chains (and know when reduce hurts readability).
 *    4. Prefer non-mutating methods: toSorted, toReversed, toSpliced, with.
 *    5. Sort numbers correctly with a comparator.
 *    6. Group items with Object.groupBy.
 *    7. Explain why array methods don't wait for async callbacks.
 *
 *  How to study this file:
 *    - Every example has a numbered PREDICT comment. Write down your guess,
 *      run the file, then check the ANSWER KEY at the bottom.
 *    - Every surprise is a learning moment: re-read that example.
 *    - Then close this file and solve exercises.js from memory.
 * ============================================================================
 */

const section = (title) => console.log(`\n--- ${title} ---`);

// Sample data used throughout the lesson:
const tests = [
  { title: 'login works', status: 'passed', durationMs: 1_200, tags: ['@smoke'] },
  { title: 'cart total', status: 'failed', durationMs: 4_800, tags: ['@cart'] },
  { title: 'search', status: 'passed', durationMs: 900, tags: ['@smoke', '@search'] },
  { title: 'checkout', status: 'skipped', durationMs: 0, tags: ['@cart'] },
];

// ----------------------------------------------------------------------------
section('1. Creating arrays');
// ----------------------------------------------------------------------------
const browsers = ['chromium', 'firefox', 'webkit']; // literal: the default

// Array.from builds an array from a length or from any iterable:
console.log(Array.from({ length: 3 }, (_, index) => index * 10)); // PREDICT #1
console.log(Array.from('abc')); // PREDICT #2

// AVOID: new Array(3) creates 3 EMPTY slots (holes), and map skips holes.
console.log(new Array(3).map(() => 'x')); // PREDICT #3

// ----------------------------------------------------------------------------
section('2. map and filter: transform and select');
// ----------------------------------------------------------------------------
// map: same number of items, each one transformed.
const titles = tests.map((test) => test.title);
console.log(titles); // PREDICT #4

// filter: fewer items, each one unchanged.
const failed = tests.filter((test) => test.status === 'failed');
console.log(failed.length); // PREDICT #5

// The callback also gets the index as a second argument:
console.log(browsers.map((browser, index) => `${index}:${browser}`)); // PREDICT #6

// ----------------------------------------------------------------------------
section('3. Searching: find, findLast, some, every, includes');
// ----------------------------------------------------------------------------
console.log(tests.find((test) => test.status === 'passed').title); // PREDICT #7
console.log(tests.findLast((test) => test.status === 'passed').title); // PREDICT #8
console.log(tests.find((test) => test.status === 'flaky')); // PREDICT #9

console.log(tests.some((test) => test.status === 'failed')); // PREDICT #10
console.log(tests.every((test) => test.durationMs < 5_000)); // PREDICT #11
console.log(browsers.includes('webkit')); // PREDICT #12

// AVOID: browsers.indexOf('webkit') !== -1   PREFER: browsers.includes('webkit')
// AVOID: filter(...)[0] to get one item     PREFER: find(...) (stops early)

// ----------------------------------------------------------------------------
section('4. flatMap: map, then flatten one level');
// ----------------------------------------------------------------------------
const allTags = tests.flatMap((test) => test.tags);
console.log(allTags); // PREDICT #13
console.log([...new Set(allTags)]); // PREDICT #14

// ----------------------------------------------------------------------------
section('5. Readable chains, and when reduce hurts');
// ----------------------------------------------------------------------------
// One step per line, each step does one thing. Reads top to bottom like a recipe.
const slowPassedTitles = tests
  .filter((test) => test.status === 'passed')
  .filter((test) => test.durationMs > 1_000)
  .map((test) => test.title);
console.log(slowPassedTitles); // PREDICT #15

// reduce is great for combining items into ONE value, like a sum:
const totalMs = tests.reduce((total, test) => total + test.durationMs, 0);
console.log(totalMs); // PREDICT #16
// BEST PRACTICE: always pass the initial value (here 0). Without it, reduce
// throws on an empty array.

// AVOID: reduce that hides a map + filter. It works, but it's hard to read:
const titlesHard = tests.reduce(
  (acc, test) => (test.status === 'passed' ? [...acc, test.title] : acc),
  [],
);
// PREFER the chain that says what it does:
const titlesEasy = tests.filter((test) => test.status === 'passed').map((test) => test.title);
console.log(titlesHard.join() === titlesEasy.join()); // PREDICT #17

// ----------------------------------------------------------------------------
section('6. Mutating vs non-mutating methods');
// ----------------------------------------------------------------------------
// sort, reverse and splice CHANGE the original array. That's a common source
// of bugs when the array is shared.
const letters = ['c', 'a', 'b'];
const sortedOld = letters.sort(); // AVOID when you need the original later
console.log(letters, sortedOld === letters); // PREDICT #18

// PREFER the modern copying versions. They return a NEW array:
// (Single lowercase letters sort fine without a comparator. For numbers and
// real words, always pass one: section 7.)
const queue = ['c', 'a', 'b'];
console.log(queue.toSorted()); // PREDICT #19
console.log(queue.toReversed()); // PREDICT #20
console.log(queue.toSpliced(1, 1)); // PREDICT #21
console.log(queue.with(0, 'z')); // PREDICT #22
console.log(queue); // PREDICT #23

// A shallow copy with spread also works: [...queue]

// ----------------------------------------------------------------------------
section('7. Sorting numbers needs a comparator');
// ----------------------------------------------------------------------------
// Without a comparator, sort compares items as STRINGS.
const durations = [900, 10_000, 1_200];
console.log(durations.toSorted()); // PREDICT #24

// PREFER: (a, b) => a - b for ascending, b - a for descending.
console.log(durations.toSorted((a, b) => a - b)); // PREDICT #25

// Sorting objects by a property, and strings with localeCompare:
const byDuration = tests.toSorted((a, b) => b.durationMs - a.durationMs).map((test) => test.title);
console.log(byDuration); // PREDICT #26
console.log(['b', 'A', 'c'].toSorted((a, b) => a.localeCompare(b))); // PREDICT #27

// ----------------------------------------------------------------------------
section('8. at(-1) and Object.groupBy');
// ----------------------------------------------------------------------------
// AVOID: browsers[browsers.length - 1]     PREFER: browsers.at(-1)
console.log(browsers.at(-1), browsers.at(0)); // PREDICT #28

// Object.groupBy turns a list into { key: [items...] }:
const byStatus = Object.groupBy(tests, (test) => test.status);
console.log(Object.keys(byStatus)); // PREDICT #29
console.log(byStatus.passed.map((test) => test.title)); // PREDICT #30
// Note: the result has a NULL prototype (no inherited toString etc.), so a
// strict deepEqual against a plain {...} fails. Spread it if you need a normal
// object: { ...byStatus }. Map.groupBy returns a Map instead (Lesson 15).

// ----------------------------------------------------------------------------
section('9. Array methods do NOT wait for async callbacks');
// ----------------------------------------------------------------------------
// An async function always returns a PROMISE (Lesson 13). Array methods use
// whatever the callback returns, right away: they never await it.
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const numbers = [1, 2, 3];

// AVOID: async filter. A Promise is an object, and objects are always truthy,
// so NOTHING is filtered out:
console.log(numbers.filter(async (n) => n > 2)); // PREDICT #31

// AVOID: async map without await. You get promises, not values:
const pending = numbers.map(async (n) => n * 2);
console.log(pending[0] instanceof Promise); // PREDICT #32

// PREFER: await Promise.all(...) around an async map to run the work in
// PARALLEL and collect the results in order (Lesson 13 goes deeper):
const doubled = await Promise.all(
  numbers.map(async (n) => {
    await delay(1);
    return n * 2;
  }),
);
console.log(doubled); // PREDICT #33

// PREFER for async filtering: compute the booleans first, then filter
// synchronously. (Or use for...of + await to go one by one: Lesson 06.)
const keep = await Promise.all(numbers.map(async (n) => n > 2));
console.log(numbers.filter((_, index) => keep[index])); // PREDICT #34

// In Playwright, AVOID filtering locators with async callbacks:
//   (await rows.all()).filter(async (row) => await row.isVisible())  // keeps ALL rows!
// PREFER the built-in locator filters, which also auto-wait:
//   rows.filter({ hasText: 'Paid' })   or   rows.filter({ visible: true })

console.log('Done. Now open exercises.js and practice from memory!');

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - map transforms, filter selects, find gets one, some/every answer yes/no.
 *    - Chains read top to bottom: one small step per line.
 *    - Use reduce for "many -> one value", always with an initial value.
 *    - sort/reverse/splice mutate. Prefer toSorted/toReversed/toSpliced/with.
 *    - Numbers need a comparator: toSorted((a, b) => a - b).
 *    - at(-1) for the last item, Object.groupBy for grouping.
 *    - Array methods never await: use Promise.all(items.map(async ...)) or
 *      for...of + await.
 *
 *  In Playwright:
 *    const items = page.getByRole('listitem');
 *    await expect(items).toHaveCount(4);           // wait until the list is complete
 *    const texts = await items.allTextContents();  // one-time read: DATA extraction
 *    // "Is the list sorted like a human would expect?" (localeCompare, Lesson 03)
 *    expect(texts).toEqual(texts.toSorted((a, b) => a.localeCompare(b)));
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1  [ 0, 10, 20 ]
 *   #2  [ 'a', 'b', 'c' ]
 *   #3  [ <3 empty items> ] — map skips holes, so nothing was filled
 *   #4  [ 'login works', 'cart total', 'search', 'checkout' ]
 *   #5  1
 *   #6  [ '0:chromium', '1:firefox', '2:webkit' ]
 *   #7  login works
 *   #8  search
 *   #9  undefined
 *   #10 true
 *   #11 true
 *   #12 true
 *   #13 [ '@smoke', '@cart', '@smoke', '@search', '@cart' ]
 *   #14 [ '@smoke', '@cart', '@search' ]  (unique, Lesson 15)
 *   #15 [ 'login works' ]
 *   #16 6900
 *   #17 true
 *   #18 [ 'a', 'b', 'c' ] true — sort changed `letters` itself and returned it
 *   #19 [ 'a', 'b', 'c' ]
 *   #20 [ 'b', 'a', 'c' ]
 *   #21 [ 'c', 'b' ] (removed 1 item at index 1)
 *   #22 [ 'z', 'a', 'b' ] (replaced index 0)
 *   #23 [ 'c', 'a', 'b' ]  (unchanged!)
 *   #24 [ 10000, 1200, 900 ] — compared as strings: '1' < '9'
 *   #25 [ 900, 1200, 10000 ]
 *   #26 [ 'cart total', 'login works', 'search', 'checkout' ]
 *   #27 [ 'A', 'b', 'c' ]
 *   #28 webkit chromium
 *   #29 [ 'passed', 'failed', 'skipped' ]
 *   #30 [ 'login works', 'search' ]
 *   #31 [ 1, 2, 3 ] — nothing was filtered: every Promise is truthy
 *   #32 true
 *   #33 [ 2, 4, 6 ]
 *   #34 [ 3 ]
 * ============================================================================
 */
