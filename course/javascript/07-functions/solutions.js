/**
 * ============================================================================
 *  SOLUTIONS 07 — Functions
 * ============================================================================
 *  Run:  node course/javascript/07-functions/solutions.js
 *
 *  Compare these with YOUR solutions. If yours is different but the tests pass,
 *  it may be just as good. Read the WHY comments to see the trade-offs.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// Exercise 1
// WHY: destructuring with defaults documents every option in the signature.
// The trailing `= {}` makes describeLaunch() (no argument) safe. Defaults only
// apply to `undefined`, so slowMo: 0 and headless: false are kept. With `||`
// both would be replaced by their defaults.
function describeLaunch({ browser = 'chromium', headless = true, slowMo = 10 } = {}) {
  const mode = headless ? 'headless' : 'headed';
  return `${browser} | ${mode} | ${slowMo}ms`;
}

// Exercise 2
// WHY: rest parameters give a real array, so .reduce and .length just work.
// The guard clause handles the empty case before dividing by zero.
function average(...numbers) {
  if (numbers.length === 0) return 0;
  const total = numbers.reduce((sum, n) => sum + n, 0);
  return total / numbers.length;
}

// Exercise 3
// WHY: spread copies the user and the following property overrides one field.
// The caller's object never changes, so there are no surprises elsewhere.
function recordLogin(user) {
  return { ...user, loginCount: user.loginCount + 1 };
}

// Exercise 4
// WHY: each guard handles one problem and leaves. The order matters: check
// the type before calling .length on the value.
function checkPassword(password) {
  if (typeof password !== 'string') return 'invalid type';
  if (password.length < 8) return 'too short';
  if (!/\d/.test(password)) return 'needs a digit';
  return 'ok';
}

// Exercise 5
// WHY: the returned function "remembers" maxAttempts (a closure, Lesson 10).
// The loop returns early on success; after the loop we know every attempt
// failed, so we re-throw the last error. `let lastError` changes per attempt.
function createRetrier(maxAttempts) {
  return async function retry(action) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  };
}

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. `||` falls back for ANY falsy value, and 0 is falsy, so the
//       intended 0 becomes 30000. Fix: a default parameter,
//       function goto(url, timeout = 30_000), which only reacts to undefined.
//   Q2. `arguments` is only array-like (no .map, .reduce, ...), it isn't
//       visible in the signature, and arrow functions don't have it. Rest
//       parameters (...args) replace it.
//   Q3. The braces are read as a function BODY, not an object, so
//       `name: user.name, age: ...` is invalid. Wrap the object in
//       parentheses: (user) => ({ name: user.name, age: user.age }).
//   Q4. `2, true, false` mean nothing at the call site. Use an options object:
//       addItem('shirt', { quantity: 2, giftWrap: true, express: false }).
//       Call sites become self-documenting, the order no longer matters,
//       defaults are easy, and new options don't break existing calls.
//   Q5. map(format) passes the function so map can call it for each item.
//       map(format()) calls it once, right away, and passes its RESULT.
//       map(parseInt) passes (item, index), and parseInt treats the index as
//       the radix: ['1', '2'].map(parseInt) is [1, NaN]. Use map(Number).
//
// Review answers
//   R1. forEach ignores the promises your callbacks return: it starts every
//       step at once and returns immediately. Use for...of with await.
//   R2. It hides an action inside an expression. Readers expect && to
//       compute a value; write if (isAdmin) deleteAll(); instead.
//   R3. 'error' anywhere: 'no errors', 'error-free', 'terror'. Anchor it or
//       match the full text you expect.
// ----------------------------------------------------------------------------

// ============================== TESTS ======================================
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
