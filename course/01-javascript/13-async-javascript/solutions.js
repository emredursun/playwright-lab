/**
 * ============================================================================
 *  SOLUTIONS 13 — Asynchronous JavaScript
 * ============================================================================
 *  Run:  node course/01-javascript/13-async-javascript/solutions.js
 *
 *  Compare these with YOUR solutions. If yours is different but the tests pass,
 *  it may be just as good. Read the WHY comments to see the trade-offs.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setTimeout as sleep } from 'node:timers/promises';

// Exercise 1
// WHY: poll, return as soon as the condition holds, and fail with a clear
// message at the deadline. `await condition()` works for sync AND async
// conditions. This is the idea behind Playwright's auto-waiting, expect.poll
// and toPass, so inside tests you use those instead of writing your own.
async function waitUntil(condition, { timeout = 1_000, interval = 10 } = {}) {
  const deadline = Date.now() + timeout;
  while (true) {
    const value = await condition();
    if (value) return value;
    if (Date.now() >= deadline) {
      throw new Error(`Condition not met within ${timeout} ms`);
    }
    await sleep(interval);
  }
}

// Exercise 2
// WHY: map() calls every task immediately, so all of them start at once.
// Promise.all then waits for all of them and keeps the results in INPUT order,
// no matter which task finished first.
async function runInParallel(tasks) {
  return Promise.all(tasks.map((task) => task()));
}

// Exercise 3
// WHY: Promise.race settles with whichever promise finishes first. `finally`
// clears the timer, so a finished promise doesn't leave a timer running and
// keep the process alive. Note what it does NOT do: the original promise keeps
// running after a timeout. To really stop the work, pass an AbortSignal to it
// (e.g. fetch(url, { signal: AbortSignal.timeout(ms) })).
async function withTimeout(promise, ms) {
  let timerId;
  const timeout = new Promise((_, reject) => {
    timerId = setTimeout(() => reject(new Error(`Timed out after ${ms} ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timerId);
  }
}

// Exercise 4
// WHY: forEach ignores the promises its callback returns, so it can't wait.
// for...of + await visits the pages one by one, which a single browser tab
// needs anyway.
async function visitAll(page, urls) {
  for (const url of urls) {
    await page.goto(url);
  }
}

// Exercise 5
// WHY: allSettled attaches a handler to EVERY promise right away and never
// rejects, so every outcome is reported and no rejection goes unhandled.
// Awaiting the promises one by one in a loop fails: while you wait on the
// first, a later one rejects with no handler attached. Then plain array
// methods (Lesson 08) turn the results into a summary.
async function summarize(runs) {
  const results = await Promise.allSettled(runs);
  return {
    passed: results.filter((result) => result.status === 'fulfilled').length,
    failures: results
      .filter((result) => result.status === 'rejected')
      .map((result) => result.reason.message),
  };
}

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. Sync code first, then the .then callback (a microtask), then the
//       setTimeout callback (a macrotask).
//   Q2. The popup can open during the click, BEFORE waitForEvent starts
//       listening, so it waits until it times out. Start waiting first:
//         const popupPromise = page.waitForEvent('popup');
//         await page.getByRole('link', { name: 'Open report' }).click();
//         const popup = await popupPromise;
//   Q3. The 3 API calls are independent: Promise.all. Each page's own steps
//       (goto, fill, click) depend on each other and share that page: in
//       sequence. Separate pages can run in parallel, but in Playwright you
//       usually get that from parallel TESTS rather than inside one test.
//   Q4. Remove the fixed wait. Actions already auto-wait for the button to be
//       visible, enabled and stable. If something else must finish first,
//       wait for THAT condition: a web-first assertion
//       (await expect(button).toBeEnabled()) or a waitForResponse. Fixed waits
//       are slow when the app is fast and still flaky when it is slow.
//   Q5. Promise.race only stops WAITING; the API call itself kept running.
//       Pass an AbortSignal to the call (AbortSignal.timeout(5_000), or a
//       controller you abort) so the work is really cancelled.
//
// Review answers:
//   R1. Without `await`, the function returns the pending promise and leaves
//       the try block. When it rejects later, the catch never runs.
//   R2. forEach ignores the return value of its callback, which is the
//       promise. It starts every callback and returns immediately.
//   R3. A copy of ALL items: each async callback returns a promise, and a
//       promise is always truthy. Use Promise.all + map, or for...of.
// ----------------------------------------------------------------------------

// ============================== TESTS ======================================
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
