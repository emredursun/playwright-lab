/**
 * ============================================================================
 *  EXERCISES 12 — Error Handling
 * ============================================================================
 *  Run:  node course/01-javascript/12-error-handling/exercises.js
 *
 *  How to work:
 *    1. Replace each `throw new Error('TODO')` with your solution.
 *    2. Run the file. Every test must pass (✔). Failing tests show what's wrong.
 *    3. Answer the self-check questions in your head or on paper.
 *    4. Only THEN compare with solutions.js.
 *
 *  Struggling a bit is good: it's how memory is built. Give each exercise at
 *  least 10 minutes before you peek.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// ----------------------------------------------------------------------------
// Exercise 1 — Guard clauses
// parseTimeout(value) returns `value` as a number of milliseconds.
//   - throws a TypeError if value is not a number
//   - throws a RangeError if it's not an integer between 0 and 600_000
// The messages must contain the bad value, e.g. 'Invalid timeout: -5'.
// ----------------------------------------------------------------------------
function parseTimeout(value) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 2 — A custom error class
// Create `class HttpError extends Error` with:
//   - constructor(status, message, options) -> sets message, `status` and
//     name 'HttpError', and forwards `options` (e.g. { cause }) to super()
//   - a getter `isServerError` -> true when status is 500 or higher
// ----------------------------------------------------------------------------
class HttpError extends Error {
  constructor(status, message, options) {
    super(message, options);
    throw new Error('TODO');
  }
}

// ----------------------------------------------------------------------------
// Exercise 3 — Wrap with cause
// readJsonConfig(text) returns the parsed object. If JSON.parse fails, throw
// a NEW Error with message 'Invalid config JSON' and the original error as
// its `cause`.
// ----------------------------------------------------------------------------
function readJsonConfig(text) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 4 — Fix the swallowed error
// This function hides EVERY error, including real bugs. Rewrite it so:
//   - a HttpError with status 404 returns null (the user simply doesn't exist)
//   - any other error is rethrown unchanged
// ----------------------------------------------------------------------------
function findUserOrNull(lookup) {
  try {
    return lookup();
  } catch (error) {
    return null;
  }
}

// ----------------------------------------------------------------------------
// Exercise 5 (bonus) — Retry with finally-style bookkeeping (async)
// retry(task, attempts) awaits task() up to `attempts` times.
//   - returns the first successful result
//   - if every attempt fails, throws an Error 'Failed after N attempts' whose
//     `cause` is the LAST error
// ----------------------------------------------------------------------------
async function retry(task, attempts) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.js)
//   Q1. Name two things you lose when you `throw 'oops'` instead of an Error.
//   Q2. Does `finally` run when the `try` block contains a `return`? Can it
//       change the returned number?
//   Q3. A helper does `try { await page.getByText('Saved').click(); } catch {}`
//       "to make the test less flaky". What's wrong, and what would you do?
//   Q4. An API client wraps every failure in `new ApiError(message)`. During
//       a CI failure you only see "ApiError: request failed". What did the
//       author forget, and how do you fix it?
//   Q5. Why doesn't `try { fetchUser(-1) } catch {}` catch the async error,
//       and what happens to that rejection?
//
// Review (earlier lessons):
//   R1. (Lesson 11) Why is `name = 'HttpError'` a class FIELD rather than a
//       static field?
//   R2. (Lesson 05) What is a guard clause, and where in a function does it go?
//   R3. (Lesson 04) Why is Number('') a trap when validating input?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
test('1. parseTimeout: guards against bad input', () => {
  assert.equal(parseTimeout(30_000), 30_000);
  assert.equal(parseTimeout(0), 0);
  assert.throws(() => parseTimeout('5000'), TypeError);
  assert.throws(() => parseTimeout(-5), { name: 'RangeError', message: /-5/ });
  assert.throws(() => parseTimeout(1.5), RangeError);
  assert.throws(() => parseTimeout(600_001), RangeError);
});

test('2. HttpError: custom error with extra data', () => {
  const error = new HttpError(503, 'Service unavailable');
  assert.ok(error instanceof Error);
  assert.equal(error.name, 'HttpError');
  assert.equal(error.message, 'Service unavailable');
  assert.equal(error.status, 503);
  assert.equal(error.isServerError, true);
  assert.equal(new HttpError(404, 'Not found').isServerError, false);
  const inner = new Error('socket hang up');
  assert.equal(
    new HttpError(502, 'Bad gateway', { cause: inner }).cause,
    inner,
    'forward options to super()',
  );
});

test('3. readJsonConfig: wraps the parse error as cause', () => {
  assert.deepEqual(readJsonConfig('{"retries":2}'), { retries: 2 });
  assert.throws(
    () => readJsonConfig('{oops'),
    (error) => error.message === 'Invalid config JSON' && error.cause instanceof SyntaxError,
  );
});

test('4. findUserOrNull: handles 404, rethrows everything else', () => {
  assert.deepEqual(
    findUserOrNull(() => ({ id: 1 })),
    { id: 1 },
  );
  assert.equal(
    findUserOrNull(() => {
      throw new HttpError(404, 'Not found');
    }),
    null,
  );
  const serverError = new HttpError(500, 'Boom');
  assert.throws(
    () =>
      findUserOrNull(() => {
        throw serverError;
      }),
    (error) => error === serverError,
  );
  assert.throws(
    () =>
      findUserOrNull(() => {
        throw new TypeError('a real bug');
      }),
    TypeError,
  );
});

test('5. retry (bonus): retries and keeps the last error as cause', async () => {
  let calls = 0;
  const flaky = async () => {
    calls += 1;
    if (calls < 3) throw new Error(`attempt ${calls} failed`);
    return 'passed';
  };
  assert.equal(await retry(flaky, 3), 'passed');
  assert.equal(calls, 3);

  const alwaysFails = async () => {
    throw new Error('still broken');
  };
  await assert.rejects(
    retry(alwaysFails, 2),
    (error) =>
      error.message === 'Failed after 2 attempts' && error.cause.message === 'still broken',
  );
});
