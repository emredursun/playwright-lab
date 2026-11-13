/**
 * ============================================================================
 *  EXERCISES 07 — Functions
 * ============================================================================
 *  Run:  node course/01-javascript/07-functions/exercises.js
 *
 *  How to work:
 *    1. Replace each `throw new Error('TODO')` with your solution.
 *    2. Run the file. Every test must pass (✔). Failing tests show what's wrong.
 *    3. Answer the self-check and review questions in your head or on paper.
 *    4. Only THEN compare with solutions.js.
 *
 *  Struggling a bit is good: it's how memory is built. Give each exercise at
 *  least 10 minutes before you peek.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// ----------------------------------------------------------------------------
// Exercise 1 — Options object with defaults
// Return a launch description string. All options are optional, and calling
// with no argument at all must work too.
//   describeLaunch()                          -> 'chromium | headless | 10ms'
//   describeLaunch({ headless: false })       -> 'chromium | headed | 10ms'
//   describeLaunch({ browser: 'webkit', slowMo: 50 }) -> 'webkit | headless | 50ms'
//   describeLaunch({ slowMo: 0 })             -> 'chromium | headless | 0ms'  (0 is valid!)
// ----------------------------------------------------------------------------
function describeLaunch(options) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 2 — Rest parameters
// Return the average of any number of numbers. With no numbers, return 0.
// Example: average(2, 4, 6) -> 4
// Hint: sum with a for...of loop (Lesson 06) or reduce (Lesson 08).
// ----------------------------------------------------------------------------
function average(...numbers) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 3 — Make it pure
// This function mutates its input. Rewrite it so it returns a NEW user object
// with `loginCount` increased by 1 and leaves the original untouched.
// ----------------------------------------------------------------------------
function recordLogin(user) {
  user.loginCount += 1;
  return user;
}

// ----------------------------------------------------------------------------
// Exercise 4 — Guard clauses
// Return a validation message for a password:
//   not a string                 -> 'invalid type'
//   shorter than 8 characters    -> 'too short'
//   no digit (0-9) in it         -> 'needs a digit'
//   otherwise                    -> 'ok'
// Use early returns, no else, no nesting. Hint: /\d/.test(text)
// ----------------------------------------------------------------------------
function checkPassword(password) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 5 (bonus) — A function that returns a function
// `createRetrier(maxAttempts)` returns an async function `retry(action)`.
// retry calls `action()`; if it throws, it tries again, up to maxAttempts
// times in total. Return the first successful result. If every attempt fails,
// re-throw the LAST error. Reuse Lesson 06: a loop with an early return.
// Previews: the returned function remembers maxAttempts (a closure, Lesson
// 10); try/catch and async/await are covered in Lessons 12 and 13:
//   try { return await action(); } catch (error) { lastError = error; }
// Note: helpers like this are for TOOLING and API setup code. Inside
// Playwright tests, prefer the built-ins: auto-waiting, web-first assertions,
// expect(...).toPass() and the `retries` config option.
// ----------------------------------------------------------------------------
function createRetrier(maxAttempts) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.js)
//   Q1. Spot the bug:  function goto(url, timeout) { timeout = timeout || 30000; ... }
//       goto('/slow', 0) is meant to disable the timeout. What happens? Fix it.
//   Q2. What's wrong with `arguments`, and what replaces it?
//   Q3. Spot the bug:  const toRow = (user) => { name: user.name, age: user.age };
//       Why is this a syntax error, and what's the one-character-pair fix?
//   Q4. Review this page-object call: await cart.addItem('shirt', 2, true, false).
//       What would you change about addItem's signature, and why?
//   Q5. What's the difference between items.map(format) and items.map(format())?
//       And why is ['1', '2'].map(parseInt) a trap?
//
// Review (earlier lessons)
//   R1. (Lesson 06) Why can't you use forEach to run async Playwright steps
//       in order?
//   R2. (Lesson 05) Why is `isAdmin && deleteAll();` discouraged?
//   R3. (Lesson 03) What does an unanchored /error/ match that you might not
//       expect?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
test('1. describeLaunch: defaults for every option', () => {
  assert.equal(describeLaunch(), 'chromium | headless | 10ms');
  assert.equal(describeLaunch({ headless: false }), 'chromium | headed | 10ms');
  assert.equal(describeLaunch({ browser: 'webkit', slowMo: 50 }), 'webkit | headless | 50ms');
  assert.equal(describeLaunch({ slowMo: 0, browser: 'firefox' }), 'firefox | headless | 0ms');
});

test('2. average: works for any number of arguments', () => {
  assert.equal(average(2, 4, 6), 4);
  assert.equal(average(5), 5);
  assert.equal(average(), 0);
});

test('3. recordLogin: returns a new object, original untouched', () => {
  const user = Object.freeze({ name: 'ada', loginCount: 2 });
  const updated = recordLogin(user);
  assert.deepEqual(updated, { name: 'ada', loginCount: 3 });
  assert.equal(user.loginCount, 2);
});

test('4. checkPassword: guard clauses in the right order', () => {
  assert.equal(checkPassword(12345678), 'invalid type');
  assert.equal(checkPassword('abc1'), 'too short');
  assert.equal(checkPassword('abcdefgh'), 'needs a digit');
  assert.equal(checkPassword('abcdefg1'), 'ok');
});

test('5. createRetrier (bonus): retries and re-throws the last error', async () => {
  const retry = createRetrier(3);

  let calls = 0;
  const flaky = async () => {
    calls += 1;
    if (calls < 3) throw new Error(`fail ${calls}`);
    return 'success';
  };
  assert.equal(await retry(flaky), 'success');
  assert.equal(calls, 3);

  let attempts = 0;
  const broken = async () => {
    attempts += 1;
    throw new Error(`broken ${attempts}`);
  };
  await assert.rejects(retry(broken), { message: 'broken 3' });
  assert.equal(attempts, 3);
});
