/**
 * ============================================================================
 *  LESSON 21 — Testing Fundamentals with node:test
 * ============================================================================
 *  Run:       node course/applied/21-testing-fundamentals/lesson.ts
 *  Practice:  node course/applied/21-testing-fundamentals/exercises.ts
 *
 *  After this lesson you can:
 *    1. Write a test with Arrange / Act / Assert and pick the right assertion.
 *    2. Prove a test is useful by watching it FAIL for the right reason.
 *    3. Keep tests independent, deterministic and focused on one behavior.
 *    4. Replace dependencies with spies, stubs and fakes, and fake the clock.
 *    5. Use describe, hooks, skip and todo, and read a failure report.
 *    6. Map every concept to Playwright's test, expect, fixtures and hooks.
 *
 *  How to study this file:
 *    - Every example has a numbered PREDICT comment. Write down your guess,
 *      run the file, then check the ANSWER KEY at the bottom.
 *    - Section 8 registers real tests: their report appears at the END of
 *      the output, after "Done".
 *    - Then solve exercises.ts. This time YOU write the tests.
 *
 *  Note: node:test prints "ExperimentalWarning: The MockTimers API..." for
 *  section 7 on Node 22. That warning is expected and harmless.
 * ============================================================================
 */
import { after, afterEach, before, beforeEach, describe, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const section = (title: string): void => console.log(`\n--- ${title} ---`);

/** Runs a check and reports whether it passed, without crashing the lesson. */
const passes = (check: () => void): boolean => {
  try {
    check();
    return true;
  } catch {
    return false;
  }
};

// ----------------------------------------------------------------------------
section('1. Anatomy of a test: Arrange, Act, Assert');
// ----------------------------------------------------------------------------
// A test is a small program that runs your code with known input and
// COMPARES the result with what you expect. Every good test has 3 steps:
//   Arrange  -> set up the input and the world
//   Act      -> call the ONE thing you are testing
//   Assert   -> check the outcome
function formatDuration(ms: number): string {
  return ms < 1_000 ? `${ms}ms` : `${(ms / 1_000).toFixed(1)}s`;
}

// Arrange
const durationMs = 1_500;
// Act
const formatted = formatDuration(durationMs);
// Assert
assert.equal(formatted, '1.5s');
console.log('assertion passed:', formatted); // PREDICT #1

// Always import the STRICT flavor: `node:assert/strict`. Its equal() uses
// === and deepEqual() compares types too. The loose versions use ==.

// ----------------------------------------------------------------------------
section('2. The assertion toolbox');
// ----------------------------------------------------------------------------
try {
  assert.equal(formatDuration(999), '1.0s');
} catch (error) {
  if (error instanceof assert.AssertionError) {
    console.log(error.message.split('\n')[0]); // PREDICT #2
    console.log(error.actual, error.expected); // PREDICT #3
  }
}

// AVOID assert.ok(a === b): when it fails, it can't tell you the two values.
try {
  assert.ok(formatDuration(999) === '1.0s');
} catch (error) {
  if (error instanceof Error) console.log(error.message.split('\n')[0]); // PREDICT #4
}
// PREFER assert.equal(actual, expected): the report shows both values.

// equal() compares IDENTITY for objects. deepEqual() compares CONTENT.
console.log(passes(() => assert.equal({ tags: ['@smoke'] }, { tags: ['@smoke'] }))); // PREDICT #5
console.log(passes(() => assert.deepEqual({ tags: ['@smoke'] }, { tags: ['@smoke'] }))); // PREDICT #6

// throws / rejects / match:
assert.throws(() => JSON.parse('{oops'), SyntaxError); //                  sync errors
await assert.rejects(Promise.reject(new Error('boom')), { message: 'boom' }); // async errors
assert.match('Order #1042 confirmed', /^Order #\d+ confirmed$/); //            text patterns

// What if the code does NOT throw although you expected it to?
try {
  assert.throws(() => JSON.parse('{"valid": true}'), SyntaxError);
} catch (error) {
  if (error instanceof Error) console.log(error.message); // PREDICT #7
}

// ----------------------------------------------------------------------------
section('3. A test that never fails is worthless');
// ----------------------------------------------------------------------------
// Rule: you only trust a test after you have seen it FAIL for the right
// reason. Here are a correct and a buggy implementation of "is adult":
const isAdult = (age: number): boolean => age >= 18;
const isAdultBuggy = (age: number): boolean => age > 18; // forgets 18 itself

const weakCheck = (fn: (age: number) => boolean) => () => assert.equal(fn(30), true);
const strongCheck = (fn: (age: number) => boolean) => () => {
  assert.equal(fn(18), true); //  the boundary itself
  assert.equal(fn(17), false); // just below it
};

console.log(passes(weakCheck(isAdult)), passes(weakCheck(isAdultBuggy))); // PREDICT #8
console.log(passes(strongCheck(isAdult)), passes(strongCheck(isAdultBuggy))); // PREDICT #9

// The weak check passes for BOTH: it can never catch this bug. Test the
// boundaries (0, 1, empty, exactly-the-limit) because that's where bugs live.
// Habit: after writing a test, break the code on purpose and watch it fail.
// The exercises automate exactly that ("mutation testing").

// ----------------------------------------------------------------------------
section('4. One behavior per test, named as a sentence');
// ----------------------------------------------------------------------------
// An assertion that fails STOPS the test. Everything after it never runs.
let checksRun = 0;
passes(() => {
  checksRun += 1;
  assert.equal(formatDuration(5), '5 ms'); // fails here...
  checksRun += 1;
  assert.equal(formatDuration(2_000), '2.0s'); // ...so this is never checked
  checksRun += 1;
});
console.log(`${checksRun} of 3 checks ran`); // PREDICT #10

// AVOID one giant test named 'works' or 'test 1'.
// PREFER small tests whose names describe the behavior:
//   test('formats durations under 1 second in ms', ...)
//   test('formats durations of 1 second or more in seconds', ...)
// A red test name should tell you what broke WITHOUT opening the file.

// ----------------------------------------------------------------------------
section('5. Independent and deterministic tests');
// ----------------------------------------------------------------------------
// AVOID state shared between tests: the result then depends on the ORDER.
const sharedCart: string[] = [];
const testAddsItem = () => {
  sharedCart.push('book');
  assert.equal(sharedCart.length, 1);
};
const testStartsEmpty = () => assert.equal(sharedCart.length, 0);

console.log(passes(testStartsEmpty), passes(testAddsItem)); // PREDICT #11
sharedCart.length = 0; // reset, then run the same tests in the other order
console.log(passes(testAddsItem), passes(testStartsEmpty)); // PREDICT #12

// PREFER: each test creates its own data (or beforeEach creates it fresh).
// Playwright runs tests in parallel and in any order, so this is a MUST.

// Deterministic: same code + same input = same result, every run.
// AVOID Math.random(), the current date or real network in assertions.
// PREFER fixed values, and crypto.randomUUID() only where you need UNIQUE
// data (emails, order numbers) that the test doesn't compare exactly.
const userA = `user.${randomUUID()}@example.test`;
const userB = `user.${randomUUID()}@example.test`;
console.log(userA !== userB); // PREDICT #13

// ----------------------------------------------------------------------------
section('6. Test doubles: spy, stub and fake');
// ----------------------------------------------------------------------------
// Code that takes its dependencies as PARAMETERS is easy to test: pass in a
// double instead of the real email service, database or clock.
interface Mailer {
  send(to: string, subject: string): boolean;
}
function registerUser(email: string, mailer: Mailer): string {
  mailer.send(email, 'Welcome!');
  return `registered ${email}`;
}

// SPY: records how it was called. mock.fn() spies and can also return a value.
const send = mock.fn((_to: string, _subject: string) => true);
registerUser('ada@example.test', { send });
console.log(send.mock.callCount(), send.mock.calls[0]?.arguments); // PREDICT #14

// STUB: returns a canned answer so the code under test can run.
const fetchPrice = mock.fn(async (_sku: string) => 1_999);
console.log(await fetchPrice('BOOK-1')); // PREDICT #15

// FAKE: a small but WORKING implementation, e.g. an in-memory repository.
class FakeUserRepository {
  #users = new Map<string, { email: string; name: string }>();
  save(user: { email: string; name: string }): void {
    this.#users.set(user.email, user);
  }
  findByEmail(email: string): { email: string; name: string } | undefined {
    return this.#users.get(email);
  }
}
const repository = new FakeUserRepository();
repository.save({ email: 'ada@example.test', name: 'Ada' });
console.log(repository.findByEmail('ada@example.test')?.name ?? 'not found'); // PREDICT #16

// Inside a test use t.mock.fn(): it is restored automatically when the
// test ends. Mock at the edges (network, time, email), not your own logic.

// ----------------------------------------------------------------------------
section('7. Fake time instead of waiting');
// ----------------------------------------------------------------------------
// AVOID real sleeps in tests: slow AND flaky. PREFER a fake clock.
mock.timers.enable({ apis: ['setTimeout'] });
let fired = 0;
setTimeout(() => {
  fired += 1;
}, 60_000); // "one minute"
mock.timers.tick(59_999);
console.log('after 59.999s:', fired); // PREDICT #17
mock.timers.tick(1);
console.log('after 60s:', fired); // PREDICT #18
mock.timers.reset();
// In a test: t.mock.timers.enable(...) and t.mock.timers.tick(ms).

// ----------------------------------------------------------------------------
section('8. describe, hooks, skip and todo (real tests)');
// ----------------------------------------------------------------------------
// These are real node:test tests. Node runs them AFTER this file's other
// code has finished, so their output appears at the end.
const hookOrder: string[] = [];

describe('a suite with hooks', () => {
  before(() => hookOrder.push('before')); //           once, before all tests
  beforeEach(() => hookOrder.push('beforeEach')); //   before EVERY test
  afterEach(() => hookOrder.push('afterEach')); //     after EVERY test
  after(() => console.log(`hook order: ${hookOrder.join(' > ')}`)); // PREDICT #19

  test('first test', () => {
    hookOrder.push('test 1');
  });
  test('second test', () => {
    hookOrder.push('test 2');
  });
  test.skip('a test that is not ready yet', () => {}); // never runs
  test.todo('handles an expired session'); //            runs, reported as todo
});
// PREDICT #20: what does the test summary at the very end say?

// test.only('...') runs ONLY that test: handy while debugging, dangerous if
// committed. node:test honors it only with `node --test-only`. Playwright
// has `forbidOnly: !!process.env.CI` so a committed .only fails CI.

// ----------------------------------------------------------------------------
section('9. Reading a failure');
// ----------------------------------------------------------------------------
// A failure report has 3 parts. Read them in this order:
//   1. The MESSAGE:  "Expected values to be strictly equal:"
//   2. The DIFF:     + actual   - expected
//   3. The STACK:    the first "at ..." line is where the assertion failed.
try {
  assert.equal(formatDuration(1_250), '1.2s');
} catch (error) {
  if (error instanceof Error) {
    const firstFrame = error.stack?.split('\n').find((line) => line.trim().startsWith('at ')) ?? '';
    console.log(firstFrame.includes('lesson.ts')); // PREDICT #21
  }
}
// Click the file:line in that frame (VS Code makes it a link) and start
// there. Read the message BEFORE you touch any code.

// ----------------------------------------------------------------------------
section('10. Outdated habits you can drop');
// ----------------------------------------------------------------------------
// - Installing Mocha + Chai + Sinon for unit tests of helpers: node:test and
//   node:assert ship with Node (runner, assertions, mocks, fake timers).
// - Loose assertions (`assert.equal` from 'node:assert'): use 'node:assert/strict'.
// - `assert.ok(a === b)` and `expect(x).toBeTruthy()` for values: use the
//   assertion that shows both sides (equal / deepEqual / toBe / toEqual).
// - Real sleeps and retries until it's green: fake time, and fix the cause.
// - console.log debugging left in tests: assert the value instead.
console.log('Done. The test report follows. Then open exercises.ts!');

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - Arrange, Act, Assert. One behavior per test, named as a sentence.
 *    - Watch every new test FAIL once. Test the boundaries.
 *    - Tests share nothing, run in any order, and give the same result
 *      every time. Unique data via crypto.randomUUID().
 *    - Spy = record calls, stub = canned answer, fake = working in-memory
 *      version. Fake the clock instead of waiting.
 *    - Never commit .only. Read failures: message, diff, then stack.
 *
 *  In Playwright, the same ideas have these names:
 *    node:test                         Playwright Test
 *    test(name, fn) / describe         test(name, fn) / test.describe
 *    before / beforeEach / after...    test.beforeAll / test.beforeEach ...
 *    assert.equal(a, b)                expect(a).toBe(b)
 *    assert.deepEqual(a, b)            expect(a).toEqual(b)
 *    (no equivalent)                   await expect(locator).toHaveText(...)
 *                                      -> web-first: retries until it passes
 *    Arrange in beforeEach             fixtures: test.extend({ cartPage: ... })
 *    t.mock.timers                     page.clock.install() / fastForward()
 *    stub the network                  page.route(/\/api\//, ...)
 *    test.skip / test.todo / .only     test.skip / test.fixme / test.only
 *    --test-only                       forbidOnly: !!process.env.CI
 *    independent tests                 fullyParallel: true; never rely on order
 *    (retrying flaky tests)            retries in config: a signal, not a fix
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1  assertion passed: 1.5s
 *   #2  Expected values to be strictly equal: — the first line of the report
 *   #3  999ms 1.0s — an AssertionError carries `actual` and `expected`
 *   #4  The expression evaluated to a falsy value: — no values shown at all
 *   #5  false — two object literals are two different objects
 *   #6  true — deepEqual compares the contents
 *   #7  Missing expected exception (SyntaxError). — a throws() check fails
 *       when nothing is thrown
 *   #8  true true — the weak check passes for the buggy version too
 *   #9  true false — the boundary test catches the bug
 *   #10 1 of 3 checks ran — the first failing assert stops the test
 *   #11 true true — "starts empty" happened to run first
 *   #12 true false — same tests, other order: shared state broke one
 *   #13 true — two UUIDs are (practically) never equal
 *   #14 1 [ 'ada@example.test', 'Welcome!' ] — the spy recorded the call
 *   #15 1999 — the stub's canned answer
 *   #16 Ada — the fake really stores and finds users
 *   #17 after 59.999s: 0 — fake time moved, but not far enough
 *   #18 after 60s: 1 — the timer fired without waiting a real minute
 *   #19 hook order: before > beforeEach > test 1 > afterEach > beforeEach >
 *       test 2 > afterEach > beforeEach > afterEach — the skipped test runs
 *       no hooks, but a todo test still RUNS (and gets beforeEach/afterEach);
 *       it is only reported as "todo"
 *   #20 tests 4, pass 2, skipped 1, todo 1 (and fail 0)
 *   #21 true — the top stack frame points at this file and line
 * ============================================================================
 */
