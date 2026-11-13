/**
 * ============================================================================
 *  SOLUTIONS 12 — Error Handling
 * ============================================================================
 *  Run:  node course/01-javascript/12-error-handling/solutions.js
 *
 *  Compare these with YOUR solutions. If yours is different but the tests pass,
 *  it may be just as good. Read the WHY comments to see the trade-offs.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// Exercise 1
// WHY: two guard clauses at the top, each throwing the most specific error
// type (wrong TYPE vs. value out of RANGE). After them, `value` can be trusted.
const MAX_TIMEOUT_MS = 600_000;

function parseTimeout(value) {
  if (typeof value !== 'number') {
    throw new TypeError(`Timeout must be a number, got ${typeof value}: ${value}`);
  }
  if (!Number.isInteger(value) || value < 0 || value > MAX_TIMEOUT_MS) {
    throw new RangeError(`Invalid timeout: ${value}`);
  }
  return value;
}

// Exercise 2
// WHY: `name` makes logs readable ("HttpError: ..."), `status` is data the
// caller can branch on, and the getter keeps that rule in one place.
// Forwarding `options` to super() is what makes { cause } work: framework
// errors almost always wrap a lower-level error.
class HttpError extends Error {
  name = 'HttpError';

  constructor(status, message, options) {
    super(message, options);
    this.status = status;
  }

  get isServerError() {
    return this.status >= 500;
  }
}

// Exercise 3
// WHY: the caller gets a high-level, meaningful message, and the original
// SyntaxError (with its position info) is kept in `cause` for debugging.
function readJsonConfig(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('Invalid config JSON', { cause: error });
  }
}

// Exercise 4
// WHY: we handle exactly ONE expected case. Every other error is a signal
// that something is really wrong, so it must keep travelling up the stack.
function findUserOrNull(lookup) {
  try {
    return lookup();
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return null;
    throw error;
  }
}

// Exercise 5
// WHY: `return await` INSIDE try is important. Without `await` a rejected
// promise would escape the try block. We remember the last error and attach
// it as `cause`, so the final message is short but nothing is lost.
async function retry(task, attempts) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`Failed after ${attempts} attempts`, { cause: lastError });
}

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. The stack trace (where it happened) and the `name`/`instanceof` checks.
//       You also can't attach a `cause` or extra fields.
//   Q2. Yes, `finally` runs after return, throw and normal completion. But
//       the return value is captured BEFORE finally runs, so reassigning a
//       variable there doesn't change it (only `return` in finally would,
//       and that also swallows errors: never do it).
//   Q3. It swallows EVERY failure, including real bugs, so the test passes
//       while the feature is broken. Remove the try/catch and let Playwright
//       auto-wait; assert the outcome with a web-first assertion. If the
//       element is truly optional, catch ONLY errors.TimeoutError, or use
//       page.addLocatorHandler() for random overlays.
//   Q4. They didn't keep the original error. Accept `options` in the
//       constructor, call super(message, options), and throw
//       new ApiError('request failed', { cause: error }). The cause (status,
//       network error) then appears in the log.
//   Q5. An async function NEVER throws synchronously. fetchUser(-1) returns a
//       promise that is already rejected, and try/catch only sees synchronous
//       throws or rejections you `await`. The rejection goes unhandled, and
//       since Node 15 an unhandled rejection crashes the process.
//
// Review answers:
//   R1. Each error INSTANCE needs a name (it's read as error.name on the
//       object). A static field would live on the class (HttpError.name),
//       which is a different thing.
//   R2. A check at the TOP of a function that returns or throws early when
//       the input is invalid, so the rest of the function can trust its data.
//   R3. Number('') and Number('  ') return 0, so blank input silently becomes
//       a valid-looking number. Check for blank strings first.
// ----------------------------------------------------------------------------

// ============================== TESTS ======================================
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
