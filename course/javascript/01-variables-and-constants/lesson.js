/**
 * ============================================================================
 *  LESSON 01 — Variables & Constants
 * ============================================================================
 *  Run:       node course/javascript/01-variables-and-constants/lesson.js
 *  Practice:  node course/javascript/01-variables-and-constants/exercises.js
 *
 *  After this lesson you can:
 *    1. Choose between `const` and `let` (and explain why `var` is outdated).
 *    2. Explain block scope and the Temporal Dead Zone (TDZ).
 *    3. Tell the difference between "can't reassign" and "can't change".
 *    4. Name variables so that code reads like a sentence.
 *
 *  How to study this file:
 *    - Every example has a numbered PREDICT comment. Write down your guess,
 *      run the file, then check the ANSWER KEY at the bottom.
 *    - Every surprise is a learning moment: re-read that example.
 *    - Then close this file and solve exercises.js from memory.
 *
 *  Syntax you'll see before it's taught (just read along for now):
 *    (x) => x * 2     an arrow function (Lesson 07)
 *    list.map(fn)     transform every array item (Lesson 08)
 *    { ...object }    copy an object with spread (Lesson 09)
 * ============================================================================
 */

const section = (title) => console.log(`\n--- ${title} ---`);

// ----------------------------------------------------------------------------
section('1. Default to const');
// ----------------------------------------------------------------------------
// Mental model: a variable is a LABEL pointing at a value.
// `const` glues the label to one value forever. It does NOT freeze the value.

const baseUrl = 'https://playwright.dev';
const browsers = ['chromium', 'firefox'];

browsers.push('webkit'); // OK: we change the array, the label still points at it
console.log(browsers); // PREDICT #1

try {
  baseUrl = 'https://example.com'; // reassigning a const on purpose
} catch (error) {
  console.log(error.name); // PREDICT #2
}

// BEST PRACTICE: start with `const` everywhere. Switch to `let` only when the
// value really has to be reassigned. Readers then know at a glance which
// values change, so the code is easier to reason about.

// ----------------------------------------------------------------------------
section('2. Use let only when the value must change');
// ----------------------------------------------------------------------------
let attempts = 0;
while (attempts < 3) {
  attempts += 1;
}
console.log(attempts); // PREDICT #3

// Often you don't need `let` at all. AVOID building values step by step:
let label;
if (attempts > 2) {
  label = 'flaky';
} else {
  label = 'stable';
}
// PREFER a single expression with `const` (a simple, NON-nested ternary):
const status = attempts > 2 ? 'flaky' : 'stable';
console.log(label === status); // PREDICT #4

// ----------------------------------------------------------------------------
section('3. Why var is outdated');
// ----------------------------------------------------------------------------
// `var` is FUNCTION-scoped and hoisted. Blocks like `if` and `for` don't
// contain it, so it "leaks" out of them.

function varLeaks() {
  for (var i = 0; i < 3; i++) {
    // ...
  }
  return i; // `i` is still alive outside the loop!
}
console.log(varLeaks()); // PREDICT #5

// The classic bug: every callback shares ONE `var` variable.
// (A function that remembers a variable from outside is a closure: Lesson 10.)
const varCallbacks = [];
for (var j = 0; j < 3; j++) {
  varCallbacks.push(() => j);
}
console.log(varCallbacks.map((fn) => fn())); // PREDICT #6

// `let` creates a NEW binding for every loop iteration:
const letCallbacks = [];
for (let k = 0; k < 3; k++) {
  letCallbacks.push(() => k);
}
console.log(letCallbacks.map((fn) => fn())); // PREDICT #7

// RULE: never write `var` in modern code. Use `const`, then `let`.

// ----------------------------------------------------------------------------
section('4. Block scope and the Temporal Dead Zone');
// ----------------------------------------------------------------------------
// `let` and `const` live only inside the nearest { } block.
{
  const insideBlock = 'only visible here';
  console.log(insideBlock); // PREDICT #8
}
console.log(typeof insideBlock); // PREDICT #9

// They are hoisted too, but you can't touch them before the declaration line.
// The gap between the start of the scope and the declaration is the TDZ.
try {
  console.log(early);
} catch (error) {
  console.log(`${error.name}: ${error.message}`); // PREDICT #10
}
const early = 'declared now';

// Why the TDZ is GOOD: reading a variable too early crashes loudly instead of
// silently giving you `undefined` like `var` did.

// ----------------------------------------------------------------------------
section('5. const does not mean immutable: Object.freeze');
// ----------------------------------------------------------------------------
const config = Object.freeze({
  timeout: 30_000, // numeric separator: easier to read than 30000
  browser: { headless: true },
});

try {
  config.timeout = 1; // in modules (strict mode) this throws
} catch (error) {
  console.log(error.name); // PREDICT #11
}

config.browser.headless = false; // freeze is SHALLOW: nested objects can change
console.log(config.browser.headless); // PREDICT #12

// BEST PRACTICE: instead of mutating shared objects, create a new one
// (spread `...` copies the properties; Lesson 09):
const debugConfig = { ...config, timeout: 0 };
console.log(config.timeout, debugConfig.timeout); // PREDICT #13

// ----------------------------------------------------------------------------
section('6. Naming that reads like a sentence');
// ----------------------------------------------------------------------------
// camelCase         -> variables and functions:   loginButton, getUserName()
// PascalCase        -> classes and types:         LoginPage, ApiClient
// UPPER_SNAKE_CASE  -> fixed values known before the program runs: MAX_RETRIES
// is / has / should -> booleans:                  isVisible, hasErrors
// plural nouns      -> collections:               users, testResults

const MAX_RETRIES = 3;
const users = ['ada', 'linus'];
const hasUsers = users.length > 0;
const isRetryAllowed = attempts < MAX_RETRIES;
console.log({ hasUsers, isRetryAllowed }); // PREDICT #14

// AVOID: const d = 86400; const tmp = getU(); const flag = true;
// PREFER: const SECONDS_PER_DAY = 86_400; const currentUser = ...; const isAdmin = true;

// ----------------------------------------------------------------------------
section('7. Destructuring: declare several values at once');
// ----------------------------------------------------------------------------
const testRun = { name: 'login works', durationMs: 1_250, tags: ['@smoke'] };

const { name, durationMs } = testRun; // pull properties out by name
const [firstTag] = testRun.tags; // pull items out by position
console.log(name, durationMs, firstTag); // PREDICT #15

// Swap two values without a temporary variable:
let left = 'a';
let right = 'b';
[left, right] = [right, left];
console.log(left, right); // PREDICT #16

// ----------------------------------------------------------------------------
section('8. Outdated habits you can drop');
// ----------------------------------------------------------------------------
// - 'use strict' at the top of the file: ES modules are ALWAYS strict.
// - `var self = this`: arrow functions keep `this` (Lesson 10).
// - One `var` statement declaring many variables: declare each one where you
//   first need it, with its own `const`.
console.log('Done. Now open exercises.js and practice from memory!');

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - `const` by default, `let` when you must reassign, `var` never.
 *    - `const` stops reassignment, not mutation. Object.freeze is shallow.
 *    - let/const are block-scoped and crash if used before declaration (TDZ).
 *    - Names should say WHAT a value is: isVisible, users, MAX_RETRIES.
 *
 *  In Playwright:
 *    const loginButton = page.getByRole('button', { name: 'Log in' }); // never reassigned -> const
 *    await loginButton.click();
 *    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1  [ 'chromium', 'firefox', 'webkit' ]  (the array changed, the label didn't)
 *   #2  TypeError — reassigning a const binding is not allowed
 *   #3  3
 *   #4  true
 *   #5  3 — `var i` leaked out of the loop
 *   #6  [ 3, 3, 3 ] — all callbacks share ONE `var j`
 *   #7  [ 0, 1, 2 ] — `let` gives every iteration its own `k`
 *   #8  only visible here
 *   #9  undefined — `insideBlock` doesn't exist outside its block
 *   #10 ReferenceError: Cannot access 'early' before initialization (the TDZ)
 *   #11 TypeError — frozen objects can't be changed in strict mode
 *   #12 false — freeze is shallow, the nested object was not frozen
 *   #13 30000 0 — the original is untouched, the copy has the new value
 *   #14 { hasUsers: true, isRetryAllowed: false }
 *   #15 login works 1250 @smoke
 *   #16 b a
 * ============================================================================
 */
