/**
 * ============================================================================
 *  LESSON 16 — Clean Code (capstone)
 * ============================================================================
 *  Run:       node course/javascript/16-clean-code/lesson.js
 *  Practice:  node course/javascript/16-clean-code/exercises.js
 *
 *  This lesson brings together EVERYTHING from lessons 01-15. Clean code is
 *  code that the next reader (often you, in 3 months) understands quickly
 *  and can change safely.
 *
 *  After this lesson you can:
 *    1. Pick names that reveal intent and replace magic values with constants.
 *    2. Write small, focused, pure functions and keep side effects at the edges.
 *    3. Flatten nested logic with guard clauses.
 *    4. Judge when to remove duplication and when to leave it.
 *    5. Refactor a messy function step by step without changing its behavior.
 *    6. Write clean tests: Arrange-Act-Assert, one behavior, independent.
 *    7. Let ESLint and Prettier enforce the rules a machine can check.
 *
 *  The exercises are ONE realistic refactoring job: summary.js (a messy
 *  test-results summarizer). You first pin its behavior with
 *  characterization tests, then clean it up step by step.
 *
 *  How to study this file:
 *    - Every example has a numbered PREDICT comment. Write down your guess,
 *      run the file, then check the ANSWER KEY at the bottom.
 *    - For each AVOID example, name the problem before reading the PREFER fix.
 *    - Then close this file and solve exercises.js from memory.
 * ============================================================================
 */

const section = (title) => console.log(`\n--- ${title} ---`);

// Sample data used throughout the lesson.
const sampleResults = [
  { title: 'login', status: 'passed', durationMs: 1_200 },
  { title: 'checkout', status: 'failed', durationMs: 6_400 },
  { title: 'search', status: 'skipped', durationMs: 0 },
  { title: 'profile', status: 'failed', durationMs: 830 },
];

// ----------------------------------------------------------------------------
section('1. Names that reveal intent');
// ----------------------------------------------------------------------------
// AVOID: the reader has to decode every letter.
function calc(a, b) {
  return a.filter((x) => x.s === b).length;
}

// PREFER: the call site reads like a sentence.
function countByStatus(results, status) {
  return results.filter((result) => result.status === status).length;
}

console.log(countByStatus(sampleResults, 'failed')); // PREDICT #1
console.log(calc(sampleResults, 'failed')); // PREDICT #2
// Short names hide bugs. Good names make wrong code LOOK wrong.

// ----------------------------------------------------------------------------
section('2. No magic numbers or strings');
// ----------------------------------------------------------------------------
// AVOID: if (result.durationMs > 5000 && result.status === 'faild') { ... }
//        What is 5000? And did you spot the typo in 'faild'?

// PREFER: give every important value one name, defined in one place.
const SLOW_TEST_THRESHOLD_MS = 5_000;
const Status = Object.freeze({
  PASSED: 'passed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
});

const isSlow = (result) => result.durationMs > SLOW_TEST_THRESHOLD_MS;
const isFailed = (result) => result.status === Status.FAILED;

console.log(sampleResults.filter(isSlow).map((result) => result.title)); // PREDICT #3
console.log(sampleResults.filter(isFailed).length); // PREDICT #4
// Bonus: your editor autocompletes Status.FAILED, and TypeScript (Lesson 17)
// rejects a typo like Status.FALED.

// ----------------------------------------------------------------------------
section('3. Guard clauses instead of nesting');
// ----------------------------------------------------------------------------
const MAX_RETRIES = 2;

// AVOID: the "arrow of doom". The real logic hides three levels deep.
function shouldRetryNested(result, attempt) {
  if (result) {
    if (result.status === 'failed') {
      if (attempt < 2) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
}

// PREFER: handle the exceptional cases first and leave early.
function shouldRetry(result, attempt) {
  if (!result) return false;
  if (!isFailed(result)) return false;
  return attempt < MAX_RETRIES;
}

const retryCases = [
  [sampleResults[1], 0],
  [sampleResults[1], 2],
  [sampleResults[0], 0],
  [undefined, 0],
];
console.log(retryCases.map(([result, attempt]) => shouldRetry(result, attempt))); // PREDICT #5
console.log(retryCases.every(([r, a]) => shouldRetry(r, a) === shouldRetryNested(r, a))); // PREDICT #6

// ----------------------------------------------------------------------------
section('4. Small, focused functions');
// ----------------------------------------------------------------------------
// Each function does ONE thing and its name says what. Small functions are
// easy to name, test and reuse. Compose them like LEGO bricks:
// It returns a STRING ('6.4'), so the name says "format", not "to seconds".
const formatSeconds = (ms) => (ms / 1_000).toFixed(1);
const formatDuration = (result) => `${result.title}: ${formatSeconds(result.durationMs)}s`;
const slowestFirst = (results) => results.toSorted((a, b) => b.durationMs - a.durationMs);

console.log(slowestFirst(sampleResults).slice(0, 2).map(formatDuration)); // PREDICT #7

// Rule of thumb: if you need "and" to describe a function
// ("loads the data AND formats it AND saves it"), split it.

// ----------------------------------------------------------------------------
section('5. Pure functions, side effects at the edges');
// ----------------------------------------------------------------------------
// AVOID: a function that secretly changes outside state.
let totalDurationMs = 0;
function addDuration(result) {
  totalDurationMs += result.durationMs; // hidden side effect
}
sampleResults.forEach(addDuration);
sampleResults.forEach(addDuration); // called twice by accident -> wrong total
console.log(totalDurationMs); // PREDICT #8

// PREFER: a PURE function. Same input -> same output, no side effects.
const sumDurations = (results) => results.reduce((sum, result) => sum + result.durationMs, 0);
console.log(sumDurations(sampleResults) === sumDurations(sampleResults)); // PREDICT #9

// Keep the logic pure in the middle (easy to test). Do the side effects
// (console, files, network, the browser) in a thin layer at the edges:
console.log(`Total: ${sumDurations(sampleResults)} ms`); // PREDICT #10

// ----------------------------------------------------------------------------
section('6. Immutability: return new values');
// ----------------------------------------------------------------------------
// AVOID: sampleResults.sort(...) sorts the ORIGINAL array in place, so every
//        other piece of code using it suddenly sees a different order.
// PREFER: the copying methods toSorted, toReversed and with, plus spread.
const sortedByTitle = sampleResults.toSorted((a, b) => a.title.localeCompare(b.title));
console.log(sampleResults[0].title, sortedByTitle[0].title); // PREDICT #11

const withRenamed = sampleResults.with(0, { ...sampleResults[0], title: 'login (renamed)' });
console.log(sampleResults[0].title, '|', withRenamed[0].title); // PREDICT #12

// ----------------------------------------------------------------------------
section('7. Comments explain WHY, tools handle the style');
// ----------------------------------------------------------------------------
// AVOID comments that repeat the code:
//   // add one to retries
//   retries += 1;
// PREFER comments that explain a reason the code can't express:
//   // The payment sandbox needs ~2 s to settle, so poll instead of a fixed wait.
// Better still, a good name often replaces a comment:
const attempt = 1;
const isEligibleForRetry = isFailed(sampleResults[1]) && attempt < MAX_RETRIES;
console.log(isEligibleForRetry); // PREDICT #13
//
// Formatting (quotes, spacing, line length) is NOT something to argue about
// in a review. Let tools do it. This repo ships both:
//
//   Prettier  -> FORMATS code (quotes, indentation, line breaks).
//                npm run format        rewrite every file
//                npm run format:check  only report (what CI runs)
//   ESLint    -> FINDS BUGS and risky patterns. The repo's flat config
//                (eslint.config.js) combines:
//                  typescript-eslint        e.g. no-floating-promises: a
//                                           promise nobody awaits
//                  eslint-plugin-playwright e.g. missing-playwright-await,
//                                           no-wait-for-timeout,
//                                           prefer-web-first-assertions
//                npm run lint
//
// Try it: in a spec under tests/, delete one `await` in front of an
// expect(...) and run `npm run lint`. The linter points at the exact line,
// long before a flaky CI run would. Run Prettier on save in your editor, and
// both commands in CI, so the codebase never drifts.

// ----------------------------------------------------------------------------
section('8. DRY vs premature abstraction');
// ----------------------------------------------------------------------------
// DRY = "Don't Repeat Yourself". The same KNOWLEDGE should live in one place
// (like SLOW_TEST_THRESHOLD_MS above). But merging code that only LOOKS similar
// too early makes it worse.
//
// AVOID: one "smart" function controlled by mysterious boolean flags:
//   formatResult(result, true, false, true)   // what do these mean?!
// PREFER: an options object with named, defaulted settings...
function formatResult(result, { showDuration = true, uppercase = false } = {}) {
  const title = uppercase ? result.title.toUpperCase() : result.title;
  return showDuration ? `${title} (${formatSeconds(result.durationMs)}s)` : title;
}
console.log(formatResult(sampleResults[0])); // PREDICT #14
console.log(formatResult(sampleResults[0], { uppercase: true, showDuration: false })); // PREDICT #15
// ...or simply two separate, clearly named functions.
//
// "Rule of three": tolerate duplication twice. Extract a shared function the
// third time, when you can SEE what really is the same.

// ----------------------------------------------------------------------------
section('9. Clean tests');
// ----------------------------------------------------------------------------
// Test code is code: the same rules apply, plus a few of its own.
//
//   Arrange / Act / Assert -> set up, do ONE thing, check the outcome. Leave a
//                             blank line between the three parts.
//   One behavior per test  -> the test name says what broke when it fails.
//   Independent tests      -> any test can run alone, in any order, in
//                             parallel. No test relies on another's leftovers.
//   No logic in tests      -> no if/else, no loops that decide what to assert.
//   Deterministic data     -> no Math.random(), no "today" without control;
//                             unique values from a builder (Lesson 21).
//   No fixed waits         -> wait for a condition (Lesson 13), never sleep.
//
// Independence, shown with two tiny "tests" that share state:
const sharedCart = [];
const addsAnItem = () => {
  sharedCart.push('book');
  return sharedCart.length === 1;
};
const startsEmpty = () => sharedCart.length === 0;
console.log(startsEmpty(), addsAnItem()); // PREDICT #16
console.log(addsAnItem(), startsEmpty()); // PREDICT #17

// PREFER: every test builds its OWN fresh state (in Playwright: a fixture).
const createCart = () => [];
const addsAnItemIsolated = () => {
  const cart = createCart(); // Arrange
  cart.push('book'); // Act
  return cart.length === 1; // Assert
};
const startsEmptyIsolated = () => createCart().length === 0;
console.log(addsAnItemIsolated(), startsEmptyIsolated(), addsAnItemIsolated()); // PREDICT #18

// ----------------------------------------------------------------------------
section('10. Refactoring a messy function, step by step');
// ----------------------------------------------------------------------------
// BEFORE: working code, but it uses var, ==, a manual index loop,
// one-letter names, magic numbers, nesting and string concatenation.
function report(d) {
  var s = '';
  var p = 0;
  var f = 0;
  for (var i = 0; i < d.length; i++) {
    if (d[i].status == 'passed') {
      p++;
    } else {
      if (d[i].status == 'failed') {
        f++;
        s = s + 'FAILED: ' + d[i].title + ' (' + (d[i].durationMs / 1000).toFixed(1) + 's)\n';
      }
    }
  }
  s = s + p + ' passed, ' + f + ' failed';
  if (d.length > 0) {
    s = s + ' (' + Math.round((p / d.length) * 100) + '% pass rate)';
  }
  return s;
}

// AFTER. The steps taken, each one small and checked:
//   1. Safety net first: compare old and new output (see below).
//   2. Rename: d -> results, p -> passed, f -> failed, s -> lines.
//   3. var -> const, == -> ===, string concatenation -> template literals.
//   4. Replace the index loop and counters with filter/map (Lesson 08).
//   5. Extract small named helpers and use the constants from section 2.
const formatFailure = (result) => `FAILED: ${result.title} (${formatSeconds(result.durationMs)}s)`;
const toPercent = (part, total) => Math.round((part / total) * 100);

function createReport(results) {
  const passed = results.filter((result) => result.status === Status.PASSED);
  const failed = results.filter(isFailed);
  const summary = `${passed.length} passed, ${failed.length} failed`;
  const passRate =
    results.length > 0 ? ` (${toPercent(passed.length, results.length)}% pass rate)` : '';
  return [...failed.map(formatFailure), summary + passRate].join('\n');
}

console.log(createReport(sampleResults));
// PREDICT #19

// The safety net: same output for normal AND edge-case inputs.
const inputs = [sampleResults, [], [sampleResults[0]]];
console.log(inputs.every((input) => report(input) === createReport(input))); // PREDICT #20

console.log('\nDone. Now open exercises.js and practice from memory!');

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - Names reveal intent. Magic values become named constants.
 *    - Guard clauses keep the main path flat and obvious.
 *    - Functions are small, do one thing, and are pure when possible.
 *    - Side effects (I/O, logging, the browser) live at the edges.
 *    - Don't mutate: toSorted, with, spread. Comments explain WHY.
 *    - Remove duplicated KNOWLEDGE. Leave code that just looks similar
 *      until the rule of three.
 *    - Refactor in small steps, behind a safety net of tests. Pin current
 *      behavior (characterization tests) BEFORE you change anything.
 *    - Clean tests: Arrange-Act-Assert, one behavior, independent,
 *      deterministic, no logic, no fixed waits.
 *    - Prettier formats, ESLint finds bugs, humans review the design.
 *
 *  In Playwright:
 *    - A page object = small, well-named methods (loginPage.signIn(user)).
 *    - Test data and timeouts are named constants, not magic values.
 *    - Tests are the safety net that lets you refactor the app or the POM.
 *    - Each test sets up its own state with fixtures, so tests run in
 *      parallel and in any order (Lesson 23).
 *    - npm run lint catches a missing await before CI does.
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1   2
 *   #2   0  (bug: `x.s` doesn't exist, and nobody noticed)
 *   #3   [ 'checkout' ]
 *   #4   2
 *   #5   [ true, false, false, false ]
 *   #6   true
 *   #7   [ 'checkout: 6.4s', 'login: 1.2s' ]
 *   #8   16860
 *   #9   true
 *   #10  Total: 8430 ms
 *   #11  login checkout
 *   #12  login | login (renamed)
 *   #13  true
 *   #14  login (1.2s)
 *   #15  LOGIN
 *   #16  true true
 *   #17  false false   (same tests, other order: both fail!)
 *   #18  true true true
 *   #19  FAILED: checkout (6.4s)
 *        FAILED: profile (0.8s)
 *        1 passed, 2 failed (25% pass rate)
 *   #20  true
 * ============================================================================
 */
