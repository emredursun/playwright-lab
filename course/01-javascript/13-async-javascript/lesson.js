/**
 * ============================================================================
 *  LESSON 13 — Asynchronous JavaScript
 * ============================================================================
 *  Run:       node course/01-javascript/13-async-javascript/lesson.js
 *  Practice:  node course/01-javascript/13-async-javascript/exercises.js
 *
 *  After this lesson you can:
 *    1. Explain the event loop: call stack, microtasks and macrotasks.
 *    2. Read and write promises, and prefer async/await over .then chains.
 *    3. Choose between sequential and parallel work (Promise.all & friends).
 *    4. Loop over async work correctly (for...of, NOT forEach).
 *    5. Add timeouts and handle async errors.
 *    6. Spot the #1 Playwright bug: a missing `await`.
 *
 *  How to study this file:
 *    - Every example has a numbered PREDICT comment. Write down your guess,
 *      run the file, then check the ANSWER KEY at the bottom.
 *    - Then close this file and solve exercises.js from memory.
 * ============================================================================
 */
import { setTimeout as sleep } from 'node:timers/promises';

const section = (title) => console.log(`\n--- ${title} ---`);

// ----------------------------------------------------------------------------
section('1. The event loop: who runs first?');
// ----------------------------------------------------------------------------
// Mental model: a restaurant with ONE chef (JavaScript is single-threaded).
//   call stack  -> the dish the chef is cooking right now (sync code)
//   microtasks  -> VIP orders: promise callbacks, run as soon as the stack is empty
//   macrotasks  -> regular orders: timers, I/O, run one per loop turn, after
//                  ALL microtasks are done
const order = [];
order.push('1 sync start');
setTimeout(() => order.push('5 timeout (macrotask)'), 0);
Promise.resolve().then(() => order.push('3 promise (microtask)'));
queueMicrotask(() => order.push('4 queueMicrotask (microtask)'));
order.push('2 sync end');

await sleep(10); // wait until the queues have drained
console.log(order);
// PREDICT #1
// Takeaway: setTimeout(fn, 0) does NOT mean "now". It means "after
// everything that's already queued".
//
// Node detail: Node (where Playwright tests run) also has process.nextTick,
// a separate queue drained around the promise microtasks. Its exact order
// depends on context (CommonJS vs ES modules), so never rely on it. You
// almost never need it; queueMicrotask is the standard choice.

// ----------------------------------------------------------------------------
section('2. From callbacks to promises to async/await');
// ----------------------------------------------------------------------------
// AVOID (callback hell): every step nests one level deeper, and errors must
// be checked by hand at every level.
//   login(user, (err, session) => {
//     if (err) return done(err);
//     openCart(session, (err, cart) => {
//       if (err) return done(err);
//       checkout(cart, (err, receipt) => { ... });
//     });
//   });

const login = async (user) => ({ user, token: 'abc' });
const openCart = async (session) => ({ owner: session.user, items: 2 });
const checkout = async (cart) => `receipt for ${cart.owner} (${cart.items} items)`;

// OK, but noisy: a .then chain.
const viaThen = await login('ada')
  .then((session) => openCart(session))
  .then((cart) => checkout(cart));

// PREFER: async/await reads top to bottom like synchronous code.
async function buy(user) {
  const session = await login(user);
  const cart = await openCart(session);
  return checkout(cart);
}
const viaAwait = await buy('ada');
console.log(viaThen === viaAwait, viaAwait); // PREDICT #2

// An async function ALWAYS returns a promise:
console.log(buy('linus') instanceof Promise); // PREDICT #3

// ----------------------------------------------------------------------------
section('3. Creating promises');
// ----------------------------------------------------------------------------
// You rarely need `new Promise`. Use it only to wrap callback-style APIs.
// (For timers, node:timers/promises already gives you a promise version.)
function delay(ms, value) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}
console.log(await delay(5, 'resolved after 5 ms')); // PREDICT #4

// Promise.withResolvers(): resolve the promise from OUTSIDE the executor.
// Handy for "wait until some event happens".
const { promise: pageLoaded, resolve: markLoaded } = Promise.withResolvers();
setTimeout(() => markLoaded('load event'), 5);
console.log(await pageLoaded); // PREDICT #5

// ----------------------------------------------------------------------------
section('4. Sequential vs. parallel');
// ----------------------------------------------------------------------------
// We count how many requests are "in flight" at the same moment. That shows
// the difference without depending on a fast or slow machine.
let inFlight = 0;
let maxInFlight = 0;
const fetchUser = async (id) => {
  inFlight += 1;
  maxInFlight = Math.max(maxInFlight, inFlight);
  await sleep(20);
  inFlight -= 1;
  return { id };
};

const one = await fetchUser(1); // wait 20 ms...
const two = await fetchUser(2); // ...then another 20 ms (about 40 ms total)
console.log('sequential, max in flight:', maxInFlight); // PREDICT #6

maxInFlight = 0;
const [three, four] = await Promise.all([fetchUser(3), fetchUser(4)]); // both at once (about 20 ms)
console.log('parallel, max in flight:', maxInFlight); // PREDICT #7
console.log([one.id, two.id, three.id, four.id]); // PREDICT #8

// RULE: if the steps DON'T depend on each other, run them in parallel.
// If step 2 needs step 1's result (or they share state, like a browser page),
// run them in sequence.

// ----------------------------------------------------------------------------
section('5. The Promise combinators');
// ----------------------------------------------------------------------------
const ok = (value, ms) => sleep(ms, value);
const fail = async (message) => {
  throw new Error(message);
};

// all: every promise must succeed. Rejects at the FIRST failure, but the
// OTHER promises keep running. Nothing gets cancelled.
try {
  await Promise.all([ok('a', 5), fail('b broke')]);
} catch (error) {
  console.log('all ->', error.message); // PREDICT #9
}

// allSettled: waits for everything and reports each outcome. Never rejects.
const settled = await Promise.allSettled([ok('a', 5), fail('b broke')]);
console.log(
  'allSettled ->',
  settled.map((result) => result.status),
); // PREDICT #10

// race: the first one to SETTLE wins (success OR failure). The loser keeps
// running in the background; race does not stop it.
console.log('race ->', await Promise.race([ok('slow', 30), ok('fast', 5)])); // PREDICT #11

// any: the first one to SUCCEED wins. Failures are ignored unless ALL fail,
// and then it rejects with an AggregateError (Lesson 12) holding every error.
console.log('any ->', await Promise.any([fail('down'), ok('mirror', 5)])); // PREDICT #12

// ----------------------------------------------------------------------------
section('6. Awaiting in loops: for...of, not forEach');
// ----------------------------------------------------------------------------
const visited = [];
const visit = async (url) => {
  await sleep(5);
  visited.push(url);
};

// AVOID: forEach does NOT wait for async callbacks. It starts them and moves on.
['/a', '/b'].forEach(async (url) => {
  await visit(url);
});
console.log('after forEach:', visited.length); // PREDICT #13

await sleep(20); // let the "forgotten" work finish before we continue
visited.length = 0;

// PREFER: for...of with await runs one step after another, in order.
for (const url of ['/a', '/b']) {
  await visit(url);
}
console.log('after for...of:', visited); // PREDICT #14

// Parallel AND waited for: map to promises, then Promise.all.
await Promise.all(['/c', '/d'].map((url) => visit(url)));
console.log(visited.length); // PREDICT #15

// ----------------------------------------------------------------------------
section('7. Timeouts and cancellation');
// ----------------------------------------------------------------------------
// AbortSignal.timeout(ms) gives you a signal that aborts by itself. Many
// modern APIs accept one: fetch, timers/promises, streams...
try {
  await sleep(1_000, 'too late', { signal: AbortSignal.timeout(10) });
} catch (error) {
  console.log(error.name); // PREDICT #16
}

// AbortController: cancel MANUALLY. You keep the controller and hand out its
// `signal`. Your own async functions should accept { signal } too, and check
// it between steps with signal.throwIfAborted().
async function runSteps(steps, { signal } = {}) {
  const done = [];
  for (const step of steps) {
    signal?.throwIfAborted(); // throws signal.reason once aborted
    await step();
    done.push(step.name);
  }
  return done;
}

const controller = new AbortController();
const steps = [
  async function build() {},
  async function test() {
    controller.abort(new Error('cancelled by user')); // e.g. Ctrl+C handler
  },
  async function deploy() {},
];
try {
  await runSteps(steps, { signal: controller.signal });
} catch (error) {
  console.log(error.message); // PREDICT #17
}

// AbortSignal.any combines signals: abort on user cancel OR on timeout.
const userCancel = new AbortController();
const combined = AbortSignal.any([userCancel.signal, AbortSignal.timeout(10)]);
try {
  await sleep(1_000, 'too late', { signal: combined });
} catch {
  console.log(combined.reason.name); // PREDICT #18
}

// Remember: Promise.race([work, timeout]) only STOPS WAITING. The work itself
// keeps running unless you pass it a signal and it listens.

// ----------------------------------------------------------------------------
section('8. Start waiting BEFORE you trigger');
// ----------------------------------------------------------------------------
// Some things happen as a RESULT of an action: a network response after a
// click, a popup after a link. If you start waiting AFTER the action, the
// event may already be over, and you wait forever.
// A fake page: the click sends a request whose response arrives right away.
function createFakePage() {
  const waiters = [];
  return {
    waitForResponse(urlPart) {
      const { promise, resolve } = Promise.withResolvers();
      waiters.push({ urlPart, resolve });
      return promise;
    },
    async clickSave() {
      const response = { url: '/api/save', status: 200 };
      for (const waiter of waiters.splice(0)) {
        if (response.url.includes(waiter.urlPart)) waiter.resolve(response);
      }
    },
  };
}

// AVOID: action first, then wait. The response has already come and gone.
const latePage = createFakePage();
await latePage.clickSave();
const missed = await Promise.race([
  latePage.waitForResponse('/api/save'),
  sleep(20, 'still waiting...'),
]);
console.log(missed); // PREDICT #19

// PREFER: create the waiting promise first (no await!), then act, then await it.
const page = createFakePage();
const responsePromise = page.waitForResponse('/api/save');
await page.clickSave();
const response = await responsePromise;
console.log(response.status); // PREDICT #20

// ----------------------------------------------------------------------------
section('9. Wait for a CONDITION, not a duration');
// ----------------------------------------------------------------------------
// AVOID in tests: `await sleep(3_000)` (Playwright: page.waitForTimeout).
// It's too slow when the app is fast and still flaky when the app is slow.
// PREFER: poll a condition with a timeout, and stop as soon as it's true.
async function waitUntil(condition, { timeout = 1_000, interval = 10 } = {}) {
  const deadline = Date.now() + timeout;
  while (true) {
    const value = await condition();
    if (value) return value;
    if (Date.now() >= deadline) throw new Error(`Condition not met within ${timeout} ms`);
    await sleep(interval);
  }
}

let jobStatus = 'queued';
setTimeout(() => {
  jobStatus = 'done';
}, 30);
console.log(await waitUntil(() => jobStatus === 'done' && jobStatus)); // PREDICT #21

// In Playwright you rarely write this yourself, because it's built in:
//   - actions (click, fill) auto-wait until the element is ready,
//   - web-first assertions retry:   await expect(locator).toHaveText('Saved');
//   - expect.poll retries a VALUE:  await expect.poll(() => api.jobStatus(id)).toBe('done');
//   - toPass retries a BLOCK:       await expect(async () => { ... }).toPass();
// Write a helper like waitUntil only for non-UI tooling (setup scripts, APIs).

// ----------------------------------------------------------------------------
section('10. Error handling with async/await');
// ----------------------------------------------------------------------------
async function loadDashboard() {
  try {
    await fail('API is down');
    return 'dashboard';
  } catch (error) {
    throw new Error('Dashboard failed to load', { cause: error }); // Lesson 12
  }
}

try {
  await loadDashboard();
} catch (error) {
  console.log(`${error.message} <- ${error.cause.message}`); // PREDICT #22
}

// AVOID: an un-awaited, un-caught promise rejection. Node crashes the
// process with "unhandled rejection", which is good, because it's a bug.
// Always `await` a promise, return it, or handle it.

// ----------------------------------------------------------------------------
section('11. The #1 Playwright bug: a missing await');
// ----------------------------------------------------------------------------
// Every Playwright action returns a promise. Forget `await`, and the next line
// runs BEFORE the action finished: flaky tests, or a "page closed" error.
const fakePage = {
  url: '/login',
  async goto(url) {
    await sleep(5);
    this.url = url;
  },
};

fakePage.goto('/dashboard'); // BUG: missing await
console.log('without await:', fakePage.url); // PREDICT #23

await fakePage.goto('/dashboard'); // FIX
console.log('with await:', fakePage.url); // PREDICT #24

// Top-level await (used all over this file) works in ES modules. You can
// await at the top level without wrapping code in an async function.
console.log('Done. Now open exercises.js and practice from memory!');

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - Sync code first, then ALL microtasks (promises), then one macrotask
 *      (timers).
 *    - Prefer async/await over callback nesting and long .then chains.
 *    - Independent work -> Promise.all. Dependent or shared work -> sequential.
 *    - all fails fast, allSettled reports everything, race = first settled,
 *      any = first success.
 *    - Never `await` inside forEach. Use for...of, or map + Promise.all.
 *    - Use AbortSignal.timeout / AbortController for timeouts and cancel.
 *      race/all stop WAITING; they don't stop the work.
 *    - Start waiting for an event BEFORE the action that causes it.
 *    - Wait for a condition, never for a fixed duration.
 *    - Always await or handle promises.
 *
 *  In Playwright:
 *    await page.goto('/login');                     // every action: await
 *    await page.getByLabel('Email').fill(email);
 *    await expect(page).toHaveURL(/dashboard/);     // assertions too!
 *    const responsePromise = page.waitForResponse(/api\/save/);
 *    await page.getByRole('button', { name: 'Save' }).click();
 *    expect((await responsePromise).ok()).toBe(true);
 *    // Never: await page.waitForTimeout(3_000);
 *    // ESLint's @typescript-eslint/no-floating-promises and
 *    // eslint-plugin-playwright's missing-playwright-await catch forgotten awaits.
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1   [
 *          '1 sync start',
 *          '2 sync end',
 *          '3 promise (microtask)',
 *          '4 queueMicrotask (microtask)',
 *          '5 timeout (macrotask)'
 *        ]
 *   #2   true receipt for ada (2 items)
 *   #3   true
 *   #4   resolved after 5 ms
 *   #5   load event
 *   #6   sequential, max in flight: 1
 *   #7   parallel, max in flight: 2
 *   #8   [ 1, 2, 3, 4 ]
 *   #9   all -> b broke
 *   #10  allSettled -> [ 'fulfilled', 'rejected' ]
 *   #11  race -> fast
 *   #12  any -> mirror
 *   #13  after forEach: 0
 *   #14  after for...of: [ '/a', '/b' ]
 *   #15  4
 *   #16  AbortError
 *   #17  cancelled by user   (deploy never ran)
 *   #18  TimeoutError   (the timeout fired first)
 *   #19  still waiting...   (in Playwright: a timeout)
 *   #20  200
 *   #21  done
 *   #22  Dashboard failed to load <- API is down
 *   #23  without await: /login
 *   #24  with await: /dashboard
 * ============================================================================
 */
