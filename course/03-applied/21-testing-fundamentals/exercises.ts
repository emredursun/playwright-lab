/**
 * ============================================================================
 *  EXERCISES 21 — Testing Fundamentals (YOU write the tests)
 * ============================================================================
 *  Run:  node course/03-applied/21-testing-fundamentals/exercises.ts
 *
 *  This time the code is finished (shop.ts) and the TESTS are missing.
 *
 *  How your tests are checked (see harness.ts):
 *    1. Your tests run against the CORRECT shop.ts. They must all pass.
 *    2. They run again against BUGGY copies (variants.ts). For every buggy
 *       copy at least one of your tests must FAIL. A bug that slips through
 *       is shown by name, so you know which test is missing.
 *
 *  How to work:
 *    1. Replace each TODO test with real tests: test('does X', () => {...}).
 *       Use Arrange / Act / Assert and one behavior per test.
 *    2. Run the file. Fix your tests until every check is ✔.
 *    3. See your own tests' output for one exercise:
 *         node course/03-applied/21-testing-fundamentals/exercises.ts --exercise 1
 *       Add `--variant 0` to run them against buggy variant 0.
 *    4. Answer the self-check and review questions, THEN read solutions.ts.
 *
 *  Struggling a bit is good: it's how memory is built. Give each exercise at
 *  least 10 minutes before you peek.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSuites } from './harness.ts';
import type { Shop } from './variants.ts';

// ----------------------------------------------------------------------------
// Exercise 1 — Test cartTotal(items)
// Behavior to pin down (at least one test per bullet):
//   - the total is the sum of priceCents × quantity
//   - an empty cart costs 0
//   - a negative or fractional quantity throws a RangeError (message names the item)
// Tools: assert.equal, assert.throws(fn, RangeError)
// ----------------------------------------------------------------------------
function cartTotalTests({ cartTotal }: Shop): void {
  test('TODO: write your tests for cartTotal', () => {
    throw new Error('TODO');
  });
}

// ----------------------------------------------------------------------------
// Exercise 2 — Test applyDiscount(totalCents, code)
// Behavior to pin down:
//   - 'SAVE10' takes 10% off, 'HALF' takes 50% off
//   - codes are case-insensitive and surrounding spaces are ignored
//   - the result is rounded to the NEAREST cent
//   - an unknown code throws an Error matching /Unknown discount code/
// Hint: choose inputs where a wrong implementation gives a different answer.
// ----------------------------------------------------------------------------
function applyDiscountTests({ applyDiscount }: Shop): void {
  test('TODO: write your tests for applyDiscount', () => {
    throw new Error('TODO');
  });
}

// ----------------------------------------------------------------------------
// Exercise 3 — Test withRetry(action, { attempts }) (async)
// Behavior to pin down:
//   - resolves with the action's result; no extra calls after a success
//   - retries failed attempts until one succeeds
//   - calls the action at most `attempts` times, then rejects with the error
//     from the LAST attempt
// Tools: async tests, t.mock.fn(async () => ...), fn.mock.callCount(),
//        await assert.rejects(promise, { message: '...' })
// ----------------------------------------------------------------------------
function withRetryTests({ withRetry }: Shop): void {
  test('TODO: write your tests for withRetry', () => {
    throw new Error('TODO');
  });
}

// ----------------------------------------------------------------------------
// Exercise 4 — Test createTestUser(overrides)
// Behavior to pin down:
//   - defaults: role 'member' and a valid-looking email
//   - two users never share an id or an email (parallel tests need this)
//   - every override wins over the default value
// ----------------------------------------------------------------------------
function createTestUserTests({ createTestUser }: Shop): void {
  test('TODO: write your tests for createTestUser', () => {
    throw new Error('TODO');
  });
}

// ----------------------------------------------------------------------------
// Exercise 5 (bonus) — Test createIdleTimer(onIdle, idleMs) with fake time
// Behavior to pin down:
//   - onIdle is called exactly ONCE after idleMs without activity
//   - touch() restarts the countdown
//   - stop() cancels it
// Tools: t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] }),
//        t.mock.timers.tick(ms), t.mock.fn()
// Never use real waiting in a test: fake the clock instead.
// ----------------------------------------------------------------------------
function idleTimerTests({ createIdleTimer }: Shop): void {
  test('TODO: write your tests for createIdleTimer', () => {
    throw new Error('TODO');
  });
}

// `assert` is imported for your tests. This line only silences "unused".
void assert;

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.ts)
//   Q1. You wrote a test and it passed on the first run. What do you know
//       about it so far, and what should you do next?
//   Q2. Test B passes when the whole file runs but fails when you run it
//       alone. What is the most likely cause, and how do you fix it?
//   Q3. Your Playwright suite creates users with the email 'qa@example.com'.
//       It passes locally and fails in CI with 4 workers. Why, and what
//       would you change?
//   Q4. Spy, stub or fake: which one do you need to check that a logger was
//       called with the right message? And to replace a slow user database
//       in many tests?
//   Q5. Why must `test.only` never be committed, and how do node:test and
//       Playwright protect you from it?
//
// Review (earlier lessons)
//   R1. (Lesson 13) Why does `items.forEach(async (item) => { await check(item) })`
//       make a test pass even when a check fails?
//   R2. (Lesson 12) How do you assert that an async function rejects with a
//       specific message, and why is a bare try/catch in a test risky?
//   R3. (Lesson 18) What must a type guard for API data do that `as User`
//       does not?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
checkSuites(import.meta.filename, {
  1: cartTotalTests,
  2: applyDiscountTests,
  3: withRetryTests,
  4: createTestUserTests,
  5: idleTimerTests,
});
