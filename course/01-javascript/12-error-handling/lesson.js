/**
 * ============================================================================
 *  LESSON 12 — Error Handling
 * ============================================================================
 *  Run:       node course/01-javascript/12-error-handling/lesson.js
 *  Practice:  node course/01-javascript/12-error-handling/exercises.js
 *
 *  After this lesson you can:
 *    1. Throw real Error objects with clear messages (never plain strings).
 *    2. Use try / catch / finally, and know what `finally` guarantees.
 *    3. Create custom error classes and chain errors with `cause`.
 *    4. Decide when to catch, when to rethrow, and when to let it crash.
 *    5. Handle errors in async code (a preview of Lesson 13).
 *
 *  How to study this file:
 *    - Every example has a numbered PREDICT comment. Write down your guess,
 *      run the file, then check the ANSWER KEY at the bottom.
 *    - Then close this file and solve exercises.js from memory.
 * ============================================================================
 */

const section = (title) => console.log(`\n--- ${title} ---`);

// ----------------------------------------------------------------------------
section('1. Throw Error objects, never strings');
// ----------------------------------------------------------------------------
// Mental model: an error is a FIRE ALARM. `throw` pulls the alarm, and the
// nearest `catch` up the call stack answers it. If nobody answers, the
// program stops.

// AVOID: throw 'Something went wrong';  -> no stack trace, no name, no cause
// PREFER: an Error (or a subclass) with a message that says what AND why.
function parsePort(text) {
  const port = Number(text);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new RangeError(`Port must be an integer from 1 to 65535, got "${text}"`);
  }
  return port;
}

try {
  parsePort('abc');
} catch (error) {
  console.log(error instanceof Error, error.name); // PREDICT #1
  console.log(error.message); // PREDICT #2
  console.log(typeof error.stack); // PREDICT #3
}

// Built-in types worth knowing: Error, TypeError (wrong type),
// RangeError (value out of range), SyntaxError (e.g. JSON.parse),
// ReferenceError (unknown variable).

// ----------------------------------------------------------------------------
section('2. try / catch / finally');
// ----------------------------------------------------------------------------
// `finally` ALWAYS runs: after success, after an error, even after `return`.
// Use it for cleanup: close files, browsers, connections.
function runWithCleanup(shouldFail) {
  const log = [];
  try {
    log.push('open browser');
    if (shouldFail) throw new Error('test failed');
    log.push('test passed');
    return log;
  } catch (error) {
    log.push(`caught: ${error.message}`);
    return log;
  } finally {
    log.push('close browser'); // runs in BOTH cases
  }
}
console.log(runWithCleanup(false)); // PREDICT #4
console.log(runWithCleanup(true)); // PREDICT #5

// Subtle: the RETURN VALUE is decided before `finally` runs. 'close browser'
// shows up only because `log` is the same array (shared by reference).
// `finally` can't replace a returned primitive:
function returnsCount() {
  let count = 1;
  try {
    return count; // the value 1 is captured here
  } finally {
    count = 99; // too late: changes the variable, not the result
  }
}
console.log(returnsCount()); // PREDICT #6

// AVOID `return` inside `finally`: it OVERRIDES the result and silently
// swallows any error thrown in try/catch.
function swallowsError() {
  try {
    throw new Error('real failure');
  } finally {
    return 'everything is fine'; // eslint flags this: no-unsafe-finally
  }
}
console.log(swallowsError()); // PREDICT #7

// ----------------------------------------------------------------------------
section('3. Custom error classes');
// ----------------------------------------------------------------------------
// Give each failure KIND its own class, so callers can react to it precisely.
class ValidationError extends Error {
  name = 'ValidationError'; // shows up in logs and stack traces

  // Accept `options` and pass it to super(), so callers can attach a cause:
  //   new ValidationError('email', 'Invalid email', { cause: originalError })
  constructor(field, message, options) {
    super(message, options);
    this.field = field; // extra data the caller can use
  }
}

function validateUser(user) {
  if (!user.email?.includes('@')) {
    throw new ValidationError('email', `Invalid email: "${user.email ?? ''}"`);
  }
  return user;
}

try {
  validateUser({ email: 'not-an-email' });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`${error.name} on ${error.field}: ${error.message}`);
    // PREDICT #8
  } else {
    throw error;
  }
}

// ----------------------------------------------------------------------------
section('4. Chain errors with `cause`');
// ----------------------------------------------------------------------------
// When you wrap a low-level error in a higher-level one, keep the original as
// `cause`. You add context without losing the root problem.
function loadConfig(json) {
  try {
    return JSON.parse(json);
  } catch (error) {
    throw new Error('Could not load test config', { cause: error });
  }
}

try {
  loadConfig('{ broken json');
} catch (error) {
  console.log(error.message); // PREDICT #9
  console.log(error.cause.name); // PREDICT #10
}

// Custom errors must forward `options` (section 3), or the cause is lost:
class LossyError extends Error {
  constructor(message) {
    super(message); // AVOID: options are dropped here
  }
}
const root = new Error('socket hang up');
console.log(new LossyError('API call failed', { cause: root }).cause); // PREDICT #11
console.log(new ValidationError('email', 'bad', { cause: root }).cause === root); // PREDICT #12

// ----------------------------------------------------------------------------
section('5. Catch only what you can handle, rethrow the rest');
// ----------------------------------------------------------------------------
// AVOID: catching everything and pretending it's fine.
//   try { doWork(); } catch {}            <- the bug is now invisible
//   try { doWork(); } catch (e) { console.log(e); }   <- logged, then ignored
// PREFER: handle the ONE case you expect, and let everything else bubble up.
function readOptionalSetting(settings, key) {
  try {
    return validateUser(settings[key]).email;
  } catch (error) {
    if (error instanceof ValidationError) return null; // expected: use default
    throw error; // unexpected: don't hide it
  }
}
console.log(readOptionalSetting({ admin: { email: 'bad' } }, 'admin')); // PREDICT #13
try {
  readOptionalSetting({}, 'admin'); // settings.admin is undefined -> TypeError
} catch (error) {
  console.log(error.name); // PREDICT #14
}

// ----------------------------------------------------------------------------
section('6. Optional catch binding');
// ----------------------------------------------------------------------------
// When you truly don't need the error object, leave it out. This is fine
// ONLY when failure is a normal, expected answer, like "this is not JSON".
function isValidJson(text) {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}
console.log(isValidJson('{"ok":true}'), isValidJson('nope')); // PREDICT #15

// ----------------------------------------------------------------------------
section('7. Guard clauses: fail fast at the boundary');
// ----------------------------------------------------------------------------
// Check inputs at the TOP of a function and throw right away. The rest of the
// function can then trust its data.
function createUser({ name, age } = {}) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw new TypeError('name must be a non-empty string');
  }
  if (!Number.isInteger(age) || age < 0) {
    throw new RangeError('age must be a non-negative integer');
  }
  return { name: name.trim(), age };
}
console.log(createUser({ name: ' ada ', age: 36 })); // PREDICT #16

// ----------------------------------------------------------------------------
section('8. Errors in async code (preview of Lesson 13)');
// ----------------------------------------------------------------------------
// With async/await, try/catch works just like in synchronous code, but only
// if you AWAIT the promise. Without `await`, the error escapes the try block.
async function fetchUser(id) {
  if (id <= 0) throw new RangeError(`Unknown user id: ${id}`);
  return { id, name: 'ada' };
}

try {
  await fetchUser(-1); // top-level await works in ES modules
} catch (error) {
  console.log(`caught async: ${error.message}`); // PREDICT #17
}

// Inside a try block, write `return await`, not just `return`. Without the
// await, the function returns BEFORE the promise rejects, so its catch never
// runs.
async function withoutAwait() {
  try {
    return fetchUser(-1);
  } catch {
    return 'handled';
  }
}
async function withAwait() {
  try {
    return await fetchUser(-1);
  } catch {
    return 'handled';
  }
}
console.log(await withAwait()); // PREDICT #18
await withoutAwait().catch((error) => console.log(`escaped: ${error.name}`)); // PREDICT #19

// ----------------------------------------------------------------------------
section('9. What can land in catch? Non-Errors and AggregateError');
// ----------------------------------------------------------------------------
// JavaScript lets you throw ANY value, and some libraries still throw strings
// or plain objects. So `catch (error)` can receive something without
// .message or .stack. Check before you use it:
function describeFailure(error) {
  return error instanceof Error
    ? `${error.name}: ${error.message}`
    : `Non-error thrown: ${String(error)}`;
}
try {
  throw 'legacy library failure'; // what old code does; never write this yourself
} catch (error) {
  console.log(describeFailure(error)); // PREDICT #20
}

// AggregateError bundles SEVERAL errors. Promise.any rejects with one when
// every promise fails (Lesson 13), and you can create one to report many
// validation problems at once.
try {
  await Promise.any([
    Promise.reject(new Error('mirror A down')),
    Promise.reject(new Error('mirror B down')),
  ]);
} catch (error) {
  console.log(
    error.name,
    error.errors.map((inner) => inner.message),
  );
  // PREDICT #21
}

// ----------------------------------------------------------------------------
section('10. Exceptions vs. result objects');
// ----------------------------------------------------------------------------
// Exceptions are for situations the caller didn't expect: bugs, broken
// config, network failure. When failure is a NORMAL outcome (a search with
// no hits, a form with invalid input), returning a result can read better.
function safeParseNumber(text) {
  // Number('') and Number('  ') are 0, so blank input needs its own check
  // (Lesson 04). Number.isFinite also rejects NaN and Infinity.
  const value = text.trim() === '' ? Number.NaN : Number(text);
  return Number.isFinite(value)
    ? { ok: true, value }
    : { ok: false, error: `"${text}" is not a number` };
}
const parsed = safeParseNumber('42');
console.log(parsed.ok ? parsed.value : parsed.error); // PREDICT #22
console.log(safeParseNumber('x').error); // PREDICT #23
console.log(safeParseNumber('').ok); // PREDICT #24

console.log('Done. Now open exercises.js and practice from memory!');

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - Throw Error objects with a clear message. Never throw strings.
 *    - finally always runs. Use it for cleanup.
 *    - Custom error classes (with `name`) let callers react to failure KINDS.
 *    - Wrap low-level errors with { cause } to add context without losing info.
 *    - Catch what you can handle and rethrow the rest. Never swallow silently.
 *    - In async code, try/catch only works on promises you `await`
 *      (and `return await` inside try).
 *    - catch can receive non-Errors: check `error instanceof Error`.
 *    - Never `return` from finally: it swallows errors.
 *
 *  In Playwright:
 *    // Let assertions throw: a failed expect IS the test failure.
 *    await expect(page.getByText('Welcome')).toBeVisible();
 *    // Don't wrap steps in try/catch to "keep going". That hides real bugs.
 *    // Use test.step(...) for structure and expect.soft(...) for non-fatal checks.
 *
 *    // The one error you may catch on purpose: a timeout on something OPTIONAL.
 *    import { errors } from '@playwright/test';
 *    try {
 *      await page.getByRole('button', { name: 'Accept cookies' }).click({ timeout: 2_000 });
 *    } catch (error) {
 *      if (!(error instanceof errors.TimeoutError)) throw error;   // rethrow the rest
 *    }
 *    // Even better for overlays that pop up at random: page.addLocatorHandler().
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1   true RangeError
 *   #2   Port must be an integer from 1 to 65535, got "abc"
 *   #3   string  (where it happened, for debugging)
 *   #4   [ 'open browser', 'test passed', 'close browser' ]
 *   #5   [ 'open browser', 'caught: test failed', 'close browser' ]
 *   #6   1
 *   #7   everything is fine   (the error is GONE)
 *   #8   ValidationError on email: Invalid email: "not-an-email"
 *   #9   Could not load test config
 *   #10  SyntaxError
 *   #11  undefined
 *   #12  true
 *   #13  null
 *   #14  TypeError  (a real bug, correctly NOT hidden)
 *   #15  true false
 *   #16  { name: 'ada', age: 36 }
 *   #17  caught async: Unknown user id: -1
 *   #18  handled
 *   #19  escaped: RangeError
 *   #20  Non-error thrown: legacy library failure
 *   #21  AggregateError [ 'mirror A down', 'mirror B down' ]
 *   #22  42
 *   #23  "x" is not a number
 *   #24  false   (not a sneaky 0)
 * ============================================================================
 */
