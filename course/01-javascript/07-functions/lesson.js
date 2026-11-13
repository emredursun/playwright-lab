/**
 * ============================================================================
 *  LESSON 07 — Functions
 * ============================================================================
 *  Run:       node course/01-javascript/07-functions/lesson.js
 *  Practice:  node course/01-javascript/07-functions/exercises.js
 *
 *  After this lesson you can:
 *    1. Choose between function declarations, expressions and arrow functions.
 *    2. Use default parameters, rest parameters and an options object.
 *    3. Write pure functions and keep side effects at the edges.
 *    4. Pass functions around as values (higher-order functions).
 *    5. Use early returns and JSDoc to make functions easy to read and use.
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
section('1. Three ways to create a function');
// ----------------------------------------------------------------------------
// a) Declaration: hoisted, so you can call it before the line it's defined on.
console.log(add(2, 3)); // PREDICT #1
function add(a, b) {
  return a + b;
}

// b) Function expression stored in a const: NOT callable before its line.
const multiply = function (a, b) {
  return a * b;
};

// c) Arrow function: short, and it doesn't have its own `this` (Lesson 10).
const square = (n) => n * n; // one expression -> implicit return
const toUser = (name) => ({ name, role: 'tester' }); // wrap objects in ( )
console.log(multiply(2, 3), square(4), toUser('ada')); // PREDICT #2

// RULE OF THUMB:
//   - Named, top-level, reusable functions -> declarations (clear stack traces,
//     readable "table of contents").
//   - Small callbacks (map, filter, event handlers) -> arrow functions.
//   - Object methods that use `this` -> method shorthand (Lesson 09/11).

// ----------------------------------------------------------------------------
section('2. Default parameters');
// ----------------------------------------------------------------------------
// AVOID the old pattern:  timeout = timeout || 30000;
// It breaks for valid "falsy" values like 0.
function oldWait(timeout) {
  timeout = timeout || 30_000;
  return timeout;
}
console.log(oldWait(0)); // PREDICT #3

// PREFER default parameters. They only apply when the argument is undefined.
function wait(timeout = 30_000) {
  return timeout;
}
console.log(wait(), wait(0), wait(undefined)); // PREDICT #4

// ----------------------------------------------------------------------------
section('3. Rest parameters (AVOID `arguments`)');
// ----------------------------------------------------------------------------
// AVOID: `arguments` is array-LIKE (no .map/.reduce) and doesn't exist in arrows.
function oldSum() {
  return Array.prototype.reduce.call(arguments, (total, n) => total + n, 0);
}

// PREFER: rest parameters give you a real array with a clear name.
// (reduce combines all items into one value: Lesson 08.)
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
console.log(oldSum(1, 2, 3), sum(1, 2, 3), sum()); // PREDICT #5

// Spread is the opposite: it turns an array into separate arguments.
const values = [4, 9, 2];
console.log(Math.max(...values)); // PREDICT #6

// ----------------------------------------------------------------------------
section('4. Options object for more than ~2 parameters');
// ----------------------------------------------------------------------------
// AVOID positional "boolean soup": what do `true, false, 3` mean here?
//   createBrowser('chromium', true, false, 3);

// PREFER one options object, destructured with defaults. Call sites become
// self-documenting and the order of options no longer matters.
function createBrowser({ name = 'chromium', headless = true, slowMo = 0 } = {}) {
  return `${name} (headless: ${headless}, slowMo: ${slowMo})`;
}
console.log(createBrowser({ slowMo: 100 })); // PREDICT #7
console.log(createBrowser()); // PREDICT #8
// The `= {}` at the end lets you call createBrowser() with no argument at all.

// ----------------------------------------------------------------------------
section('5. Pure functions and side effects');
// ----------------------------------------------------------------------------
// A PURE function: same input -> same output, and it changes nothing outside.
// Pure functions are trivial to test and safe to reuse.

// AVOID: mutates its argument (a hidden side effect).
function addTagInPlace(test, tag) {
  test.tags.push(tag);
  return test;
}
// PREFER: returns a new value and leaves the input alone.
function addTag(test, tag) {
  return { ...test, tags: [...test.tags, tag] };
}

const original = { title: 'login', tags: ['@smoke'] };
const tagged = addTag(original, '@auth');
console.log(original.tags, tagged.tags); // PREDICT #9
addTagInPlace(original, '@oops');
console.log(original.tags); // PREDICT #10

// Side effects (logging, network, clicking in a browser) are necessary — just
// keep them in a few clearly named places, and keep the logic pure.

// ----------------------------------------------------------------------------
section('6. Single responsibility and early returns');
// ----------------------------------------------------------------------------
// One function = one job. Its name should say exactly what it does.
// Early returns (guard clauses) handle edge cases first, so the main logic
// isn't buried in nested if/else.

// AVOID deep nesting:
function gradeNested(score) {
  if (typeof score === 'number') {
    if (score >= 0 && score <= 100) {
      if (score >= 50) {
        return 'pass';
      } else {
        return 'fail';
      }
    } else {
      return 'invalid';
    }
  } else {
    return 'invalid';
  }
}

// PREFER guard clauses:
function grade(score) {
  if (typeof score !== 'number') return 'invalid';
  if (score < 0 || score > 100) return 'invalid';
  return score >= 50 ? 'pass' : 'fail';
}
console.log(gradeNested(70), grade(70), grade(20), grade(140)); // PREDICT #11

// ----------------------------------------------------------------------------
section('7. Functions are values: higher-order functions');
// ----------------------------------------------------------------------------
// A higher-order function takes a function as an argument OR returns one.

// Takes a function:
const applyTwice = (fn, value) => fn(fn(value));
console.log(applyTwice(square, 3)); // PREDICT #12

// Returns a function (a "function factory"). The returned function remembers
// `prefix` even after prefixer() has finished: that's a closure (Lesson 10).
const prefixer = (prefix) => (text) => `${prefix} ${text}`;
const warn = prefixer('[WARN]');
console.log(warn('slow test')); // PREDICT #13

// Pass the function itself, don't call it:
const names = ['ada', 'linus'];
const shout = (text) => text.toUpperCase();
console.log(names.map(shout)); // PREDICT #14
// AVOID: names.map(shout()) -> calls shout immediately with no argument.

// TRAP: point-free style passes EVERY argument the caller provides. map calls
// its callback with (item, index, array), and parseInt's 2nd parameter is the
// radix, so the index becomes the base:
console.log(['1', '2', '3'].map(parseInt)); // PREDICT #15
// PREFER a function that takes exactly one argument, or wrap it:
console.log(
  ['1', '2', '3'].map(Number),
  ['1', '2', '3'].map((text) => Number.parseInt(text, 10)),
); // PREDICT #16

// ----------------------------------------------------------------------------
section('8. Document with JSDoc');
// ----------------------------------------------------------------------------
// JSDoc comments give you autocomplete and type hints in VS Code, even in
// plain .js files. Document WHAT and WHY, not line-by-line HOW.

/**
 * Builds a URL for a path on the test server.
 * @param {string} path - Path starting with "/", e.g. "/login".
 * @param {Record<string, string | number>} [query] - Optional query parameters.
 * @returns {string} The absolute URL.
 */
function buildUrl(path, query = {}) {
  const url = new URL(path, 'http://localhost:4200');
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, String(value));
  }
  return url.href;
}
console.log(buildUrl('/pages', { page: 2 })); // PREDICT #17
// Hover over buildUrl in VS Code to see the documentation pop up.

console.log('Done. Now open exercises.js and practice from memory!');

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - Declarations for named reusable functions, arrows for callbacks.
 *    - Default parameters replace `x = x || default` (which breaks on 0, '').
 *    - Rest parameters (...args) replace `arguments`.
 *    - More than ~2 parameters? Use one destructured options object.
 *    - Prefer pure functions: return new values instead of mutating inputs.
 *    - Guard clauses first, main logic last. One function, one job.
 *    - Pass functions as values: items.map(format), not items.map(format()).
 *
 *  In Playwright:
 *    test('login', async ({ page }) => { ... });   // an arrow function passed
 *                                                   // to test() — higher-order!
 *    async function login(page, { user = 'admin', password } = {}) {
 *      await page.getByLabel('Username').fill(user);
 *      await page.getByLabel('Password').fill(password);
 *      await page.getByRole('button', { name: 'Log in' }).click();
 *    }
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1  5
 *   #2  6 16 { name: 'ada', role: 'tester' }
 *   #3  30000  (0 was a valid value — bug!)
 *   #4  30000 0 30000
 *   #5  6 6 0
 *   #6  9
 *   #7  chromium (headless: true, slowMo: 100)
 *   #8  chromium (headless: true, slowMo: 0)
 *   #9  [ '@smoke' ] [ '@smoke', '@auth' ]
 *   #10 [ '@smoke', '@oops' ]  (the original changed!)
 *   #11 pass pass fail invalid
 *   #12 81
 *   #13 [WARN] slow test
 *   #14 [ 'ADA', 'LINUS' ]
 *   #15 [ 1, NaN, NaN ] — parseInt('2', 1) and parseInt('3', 2): the index became the radix
 *   #16 [ 1, 2, 3 ] [ 1, 2, 3 ]
 *   #17 http://localhost:4200/pages?page=2
 * ============================================================================
 */
