/**
 * ============================================================================
 *  EXERCISES 13 — Asynchronous JavaScript
 * ============================================================================
 *  Run:  node course/01-javascript/13-async-javascript/exercises.js
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
import { setTimeout as sleep } from 'node:timers/promises';

// ----------------------------------------------------------------------------
// Exercise 1 — Wait for a condition, not a duration
// waitUntil(condition, { timeout = 1_000, interval = 10 } = {})
//   - calls `condition()` (it may be sync or async) and awaits its result
//   - as soon as the result is truthy, returns that result
//   - otherwise waits `interval` ms and tries again
//   - once `timeout` ms have passed, rejects with an Error whose message is
//     `Condition not met within ${timeout} ms`
// Hints: Date.now() for the deadline, sleep(interval) between checks.
// ----------------------------------------------------------------------------
async function waitUntil(condition, { timeout = 1_000, interval = 10 } = {}) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 2 — Run tasks at the same time
// runInParallel(tasks): `tasks` is an array of async functions. Start ALL of
// them at once (every task starts before any task finishes) and return their
// results in the original order.
// ----------------------------------------------------------------------------
async function runInParallel(tasks) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 3 — Add a timeout to any promise
// withTimeout(promise, ms) resolves like `promise`. If it takes longer than
// `ms`, it rejects with an Error whose message is `Timed out after ${ms} ms`.
// The timer must be cleared when the promise wins (hint: `finally`).
// Note: like Promise.race, this only stops WAITING. The slow work itself keeps
// running unless it accepts an AbortSignal.
// ----------------------------------------------------------------------------
async function withTimeout(promise, ms) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 4 — Fix the forEach bug
// visitAll should visit every url IN ORDER and only resolve when ALL visits
// are done. Right now it returns too early. Fix it.
// ----------------------------------------------------------------------------
async function visitAll(page, urls) {
  urls.forEach(async (url) => {
    await page.goto(url);
  });
}

// ----------------------------------------------------------------------------
// Exercise 5 (bonus) — Summarize a test run
// summarize(runs): `runs` is an array of promises (one per test). Wait for ALL
// of them, even if some reject, and return:
//   { passed: <number fulfilled>, failures: [<message of each rejection>] }
// Careful: the promises are ALREADY running when you get them. If you await
// them one by one, a later promise can reject while you're still waiting on an
// earlier one. It has no handler yet, so Node reports an unhandled rejection
// and the test fails. Attach handlers to all of them at once.
// ----------------------------------------------------------------------------
async function summarize(runs) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.js)
//   Q1. In what order do these run: sync code, a .then callback, a
//       setTimeout(fn, 0) callback?
//   Q2. Spot the bug:
//         await page.getByRole('link', { name: 'Open report' }).click();
//         const popup = await page.waitForEvent('popup');
//       Why can this hang, and how do you rewrite it?
//   Q3. You need to create 3 users through the API and then open 3 pages
//       that each log in as one of them. What runs in parallel and what must
//       run in sequence?
//   Q4. A teammate adds `await page.waitForTimeout(2_000)` "because the
//       button is sometimes not ready". What do you suggest instead, and why?
//   Q5. Your withTimeout() rejected after 5 s, but the logs show the slow API
//       call finished 20 s later. Why, and what would actually stop it?
//
// Review (earlier lessons):
//   R1. (Lesson 12) Why write `return await` inside a try block?
//   R2. (Lesson 06) Why does forEach not wait for an async callback?
//   R3. (Lesson 08) What does `items.filter(async (item) => ...)` return?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
const createFakePage = () => {
  const visited = [];
  return {
    visited,
    goto: async (url) => {
      await sleep(url === '/slow' ? 20 : 5);
      visited.push(url);
    },
  };
};

test('1. waitUntil: polls a condition until it is truthy', async () => {
  let checks = 0;
  const value = await waitUntil(
    () => {
      checks += 1;
      return checks >= 3 ? 'ready' : false;
    },
    { timeout: 1_000, interval: 1 },
  );
  assert.equal(value, 'ready', 'return the truthy value');
  assert.equal(checks, 3, 'stop polling as soon as the condition is true');
  assert.equal(
    await waitUntil(async () => 'async ok', { timeout: 50 }),
    'async ok',
    'await async conditions',
  );
  await assert.rejects(
    waitUntil(() => false, { timeout: 20, interval: 5 }),
    {
      message: 'Condition not met within 20 ms',
    },
  );
});

test('2. runInParallel: all at once, results in order', async () => {
  const log = [];
  const task = (value, ms) => async () => {
    log.push(`start ${value}`);
    await sleep(ms);
    log.push(`end ${value}`);
    return value;
  };
  const results = await runInParallel([task(1, 15), task(2, 1), task(3, 5)]);
  assert.deepEqual(results, [1, 2, 3], 'results keep the INPUT order');
  assert.deepEqual(
    log.slice(0, 3),
    ['start 1', 'start 2', 'start 3'],
    'every task must start before any task ends',
  );
});

test('3. withTimeout: resolves in time, rejects when too slow, clears its timer', async () => {
  assert.equal(await withTimeout(sleep(5, 'fast'), 50), 'fast');
  await assert.rejects(withTimeout(sleep(80, 'slow'), 10), { message: 'Timed out after 10 ms' });

  const countTimers = () =>
    process.getActiveResourcesInfo().filter((name) => name === 'Timeout').length;
  const before = countTimers();
  await withTimeout(Promise.resolve('instant'), 60_000);
  assert.equal(countTimers(), before, 'clear the timeout timer once the promise wins');
});

test('4. visitAll: waits for every visit, in order', async () => {
  const page = createFakePage();
  await visitAll(page, ['/slow', '/a', '/b']);
  assert.deepEqual(page.visited, ['/slow', '/a', '/b']);
});

test('5. summarize (bonus): counts passes and collects failures', async () => {
  const summary = await summarize([
    sleep(5, 'ok'),
    Promise.reject(new Error('login failed')),
    sleep(1, 'ok'),
    Promise.reject(new Error('timeout')),
  ]);
  assert.deepEqual(summary, { passed: 2, failures: ['login failed', 'timeout'] });
});
