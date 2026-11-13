/**
 * ============================================================================
 *  LESSON 06 — Loops & Iteration
 * ============================================================================
 *  Run:       node course/javascript/06-loops-and-iteration/lesson.js
 *  Practice:  node course/javascript/06-loops-and-iteration/exercises.js
 *
 *  After this lesson you can:
 *    1. Use `for...of` as your default loop (and know why `for...in` is risky).
 *    2. Get the index when you need it with `.entries()`.
 *    3. Control loops with `break` and `continue`.
 *    4. Loop over objects with Object.entries.
 *    5. Explain why `forEach` can't break and doesn't wait for `await`.
 *    6. Write a simple generator and use iterator helpers.
 *
 *  How to study this file:
 *    - Every example has a numbered PREDICT comment. Write down your guess,
 *      run the file, then check the ANSWER KEY at the bottom.
 *    - Every surprise is a learning moment: re-read that example.
 *    - Then close this file and solve exercises.js from memory.
 * ============================================================================
 */

const section = (title) => console.log(`\n--- ${title} ---`);

// ----------------------------------------------------------------------------
section('1. for...of: the default loop');
// ----------------------------------------------------------------------------
// Mental model: `for...of` asks a collection "give me your next VALUE" until
// it's empty. It works on arrays, strings, Maps, Sets and anything iterable.

const browsers = ['chromium', 'firefox', 'webkit'];
for (const browser of browsers) {
  console.log(browser);
}
// PREDICT #1

for (const letter of 'ok') {
  console.log(letter); // PREDICT #2
}

// BEST PRACTICE: use `const` in for...of. Each iteration gets a new binding,
// so there's nothing to reassign.

// ----------------------------------------------------------------------------
section('2. AVOID for...in on arrays');
// ----------------------------------------------------------------------------
// `for...in` loops over KEYS (property names) as STRINGS, including inherited
// enumerable ones. It was designed for objects, not arrays.

const scores = [10, 20];
for (const key in scores) {
  console.log(key, typeof key); // PREDICT #3
}

// The index is a string, so math goes wrong:
for (const key in scores) {
  console.log(key + 1); // PREDICT #4
}

// PREFER for...of for values, and .entries() for index + value (section 3).

// ----------------------------------------------------------------------------
section('3. Need the index? Use .entries() (or a classic for)');
// ----------------------------------------------------------------------------
for (const [index, browser] of browsers.entries()) {
  console.log(`${index + 1}. ${browser}`);
}
// PREDICT #5

// A classic `for` is still fine when you need full control, e.g. stepping by 2
// or walking backwards:
const evens = [];
for (let i = 0; i <= 6; i += 2) {
  evens.push(i);
}
console.log(evens); // PREDICT #6

// ----------------------------------------------------------------------------
section('4. while and do...while');
// ----------------------------------------------------------------------------
// Use `while` when you don't know in advance how many times to loop.
let attempt = 0;
let isReady = false;
while (!isReady) {
  attempt += 1;
  isReady = attempt === 3; // pretend the 3rd attempt succeeds
}
console.log(`ready after ${attempt} attempts`); // PREDICT #7

// `do...while` always runs the body at least once:
const countdown = 0;
do {
  console.log('runs once even though countdown is 0'); // PREDICT #8
} while (countdown > 0);

// AVOID writing your own retry loops in Playwright tests: `expect(...)` and
// `expect.poll(...)` already retry for you.

// ----------------------------------------------------------------------------
section('5. break and continue');
// ----------------------------------------------------------------------------
const results = ['passed', 'skipped', 'passed', 'failed', 'passed'];

for (const result of results) {
  if (result === 'skipped') continue; // jump to the next item
  if (result === 'failed') {
    console.log('stop at first failure');
    break; // leave the loop completely
  }
  console.log(result);
}
// PREDICT #9

// Often an array method says it more clearly (Lesson 08):
console.log(results.find((result) => result === 'failed')); // PREDICT #10

// ----------------------------------------------------------------------------
section('6. Looping over objects with Object.entries');
// ----------------------------------------------------------------------------
const timeouts = { action: 5_000, navigation: 30_000, test: 60_000 };

for (const [name, ms] of Object.entries(timeouts)) {
  console.log(`${name}: ${ms / 1_000}s`);
}
// PREDICT #11

// Object.keys(obj) -> names, Object.values(obj) -> values. All three only
// include the object's OWN properties, unlike for...in.
console.log(Object.keys(timeouts).length); // PREDICT #12

// ----------------------------------------------------------------------------
section('7. forEach vs for...of');
// ----------------------------------------------------------------------------
// forEach is fine for short side effects, but it has two limits:
//   a) You can't `break` out of it (a `return` only skips ONE item).
//   b) It does NOT wait for async callbacks.

// `delay` returns a promise that resolves after `ms` milliseconds. Promises
// and async/await are explained in Lesson 13; for now just read along.
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const log = [];

// AVOID: forEach with async — it fires all callbacks and moves on immediately.
[30, 10].forEach(async (ms) => {
  await delay(ms);
  log.push(`forEach ${ms}`);
});
log.push('forEach finished?');

// PREFER: for...of + await runs the steps in order, one after another.
for (const ms of [30, 10]) {
  await delay(ms); // top-level await works in ES modules
  log.push(`for...of ${ms}`);
}
console.log(log);
// PREDICT #13

// In Playwright, steps on a page usually must happen in order, so this rule
// matters a lot: never use forEach with `await page...` inside.

// ----------------------------------------------------------------------------
section('8. Iterables and generators (optional: recognize only)');
// ----------------------------------------------------------------------------
// You'll rarely write generators in test code, but libraries use them and the
// idea of a LAZY sequence is useful. Skim sections 8 and 9 on a busy day.
// A generator function (function*) produces values lazily, one per `yield`.
function* idGenerator(prefix) {
  let id = 1;
  while (true) {
    yield `${prefix}-${id}`;
    id += 1;
  }
}

const ids = idGenerator('user');
console.log(ids.next().value, ids.next().value); // PREDICT #14

// Generators are iterable, so for...of, spread and destructuring work:
function* range(start, end) {
  for (let n = start; n < end; n++) yield n;
}
console.log([...range(1, 4)]); // PREDICT #15

// ----------------------------------------------------------------------------
section('9. Iterator helpers (optional: recognize only)');
// ----------------------------------------------------------------------------
// Iterators now have map/filter/take/toArray, and they stay LAZY: values are
// computed only as needed. That's why an endless generator is safe here.
const firstThreeEvenIds = idGenerator('order')
  .filter((id) => Number(id.split('-')[1]) % 2 === 0)
  .take(3)
  .toArray();
console.log(firstThreeEvenIds); // PREDICT #16

console.log('Done. Now open exercises.js and practice from memory!');

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - for...of is the default loop. Use `const` for the loop variable.
 *    - for...in gives string keys (and inherited ones). Don't use it on arrays.
 *    - Need the index? for (const [i, item] of items.entries()).
 *    - Objects: for (const [key, value] of Object.entries(obj)).
 *    - forEach can't break and doesn't await. Use for...of with async code.
 *    - Generators (function*) produce values lazily, and iterator helpers
 *      (.filter, .take, .toArray) keep them lazy.
 *
 *  In Playwright:
 *    const links = page.getByRole('navigation').getByRole('link');
 *    // locator.all() does NOT wait: while the list is still rendering it may
 *    // return too few items. Wait for the expected state first:
 *    await expect(links).toHaveCount(5);
 *    for (const link of await links.all()) {          // for...of + await, never forEach
 *      await expect(link).toHaveAttribute('href', /.+/);
 *    }
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1  chromium / firefox / webkit (one per line)
 *   #2  o, then k
 *   #3  0 string, then 1 string
 *   #4  01, then 11  (string concatenation!)
 *   #5  1. chromium / 2. firefox / 3. webkit
 *   #6  [ 0, 2, 4, 6 ]
 *   #7  ready after 3 attempts
 *   #8  runs once even though countdown is 0 (printed exactly once)
 *   #9  passed / passed / stop at first failure
 *   #10 failed
 *   #11 action: 5s / navigation: 30s / test: 60s
 *   #12 3
 *   #13 [ 'forEach finished?', 'forEach 10', 'forEach 30', 'for...of 30', 'for...of 10' ]
 *   #14 user-1 user-2
 *   #15 [ 1, 2, 3 ]
 *   #16 [ 'order-2', 'order-4', 'order-6' ]
 * ============================================================================
 */
