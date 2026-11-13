/**
 * ============================================================================
 *  EXERCISES 09 — Objects
 * ============================================================================
 *  Run:  node course/javascript/09-objects/exercises.js
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
// Exercise 1 — Merge config with the right precedence
// Return a new config: defaults, then file config, then CLI config.
// The LATER source wins. None of the inputs may change.
// Example: mergeConfig({ a: 1, b: 1 }, { b: 2 }, { c: 3 }) -> { a: 1, b: 2, c: 3 }
// ----------------------------------------------------------------------------
function mergeConfig(defaults, fileConfig, cliConfig) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 2 — Destructure an API response
// Return a short summary string from a response shaped like:
//   { status: 200, body: { user: { name: 'ada' } } }
// Rules:
//   - destructure in the function's parameter list
//   - if `body.user.name` is missing, use 'anonymous' (hint: ?. and ??)
// Examples:
//   describeResponse({ status: 200, body: { user: { name: 'ada' } } }) -> '200 ada'
//   describeResponse({ status: 404, body: {} })                      -> '404 anonymous'
// ----------------------------------------------------------------------------
function describeResponse(response) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 3 — Remove secret fields
// Return a copy of `user` WITHOUT the `password` and `token` properties.
// Use destructuring with rest. The original must stay unchanged.
// ----------------------------------------------------------------------------
function withoutSecrets(user) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 4 — Transform an object
// Given { login: 1200, cart: 4800, search: 900 } (milliseconds), return only
// the tests slower than `limitMs`, with durations in SECONDS.
// Example: slowTestsInSeconds({ login: 1200, cart: 4800, search: 900 }, 1000)
//          -> { login: 1.2, cart: 4.8 }
// Hint: entries -> filter -> map -> fromEntries
// ----------------------------------------------------------------------------
function slowTestsInSeconds(durations, limitMs) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 5 (bonus) — Deep copy and update
// Return a NEW config where `use.viewport.width` is set to `width`.
// The original (including its nested objects) must not change.
// Two good options: structuredClone, or nested spreads.
// ----------------------------------------------------------------------------
function withViewportWidth(config, width) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.js)
//   Q1. In { ...a, ...b }, which object's value wins when both have a key?
//   Q2. What's the difference between `'key' in obj` and Object.hasOwn(obj, 'key')?
//   Q3. A teammate writes `const local = { ...sharedConfig }; local.use.headless = false;`
//       and suddenly OTHER tests run headed. Explain the bug and fix it.
//   Q4. You need a deep copy of a config object that contains an `onRetry`
//       callback. Would you pick structuredClone, JSON round-tripping or nested
//       spreads? Why?
//   Q5. Spot the bug:  const settings = { ...overrides, ...defaults };
//
// Review (earlier lessons):
//   R1. (Lesson 02) Why is `config.retries || 3` wrong when retries is 0? What
//       should you write instead?
//   R2. (Lesson 08) Which array method would you use to turn an object's
//       entries into a NEW object with only some keys, and in which order?
//   R3. (Lesson 01) Does `const user = {...}` stop you from changing user.name?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
test('1. mergeConfig: later sources win, inputs untouched', () => {
  const defaults = Object.freeze({ headless: true, timeout: 30_000, retries: 0 });
  const fileConfig = Object.freeze({ timeout: 10_000, retries: 2 });
  const cliConfig = Object.freeze({ retries: 5 });
  assert.deepEqual(mergeConfig(defaults, fileConfig, cliConfig), {
    headless: true,
    timeout: 10_000,
    retries: 5,
  });
});

test('2. describeResponse: destructuring with a fallback', () => {
  assert.equal(describeResponse({ status: 200, body: { user: { name: 'ada' } } }), '200 ada');
  assert.equal(describeResponse({ status: 404, body: {} }), '404 anonymous');
  assert.equal(describeResponse({ status: 500 }), '500 anonymous');
});

test('3. withoutSecrets: removes password and token', () => {
  const user = Object.freeze({ id: 1, name: 'ada', password: 'hunter2', token: 'abc' });
  assert.deepEqual(withoutSecrets(user), { id: 1, name: 'ada' });
  assert.equal(user.password, 'hunter2');
});

test('4. slowTestsInSeconds: filter and convert', () => {
  assert.deepEqual(slowTestsInSeconds({ login: 1_200, cart: 4_800, search: 900 }, 1_000), {
    login: 1.2,
    cart: 4.8,
  });
  assert.deepEqual(slowTestsInSeconds({ fast: 10 }, 1_000), {});
});

test('5. withViewportWidth (bonus): deep update without mutation', () => {
  const config = { use: { baseURL: '/', viewport: { width: 1280, height: 720 } }, retries: 1 };
  const updated = withViewportWidth(config, 375);
  assert.deepEqual(updated, {
    use: { baseURL: '/', viewport: { width: 375, height: 720 } },
    retries: 1,
  });
  assert.equal(config.use.viewport.width, 1280);
});
