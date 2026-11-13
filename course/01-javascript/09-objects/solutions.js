/**
 * ============================================================================
 *  SOLUTIONS 09 — Objects
 * ============================================================================
 *  Run:  node course/01-javascript/09-objects/solutions.js
 *
 *  Compare these with YOUR solutions. If yours is different but the tests pass,
 *  it may be just as good. Read the WHY comments to see the trade-offs.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// Exercise 1
// WHY: spread copies left to right, so each later source overrides earlier
// ones. The result is a brand-new object; the inputs are only read.
function mergeConfig(defaults, fileConfig, cliConfig) {
  return { ...defaults, ...fileConfig, ...cliConfig };
}

// Exercise 2
// WHY: destructuring in the signature shows the expected shape right away.
// `body` may be missing entirely, so ?. guards every step and ?? supplies the
// fallback only for null/undefined. (Nested destructuring like
// { body: { user: { name } } } would crash when body.user is missing.)
function describeResponse({ status, body }) {
  const name = body?.user?.name ?? 'anonymous';
  return `${status} ${name}`;
}

// Exercise 3
// WHY: the named properties are pulled out and ignored; rest collects
// everything else into a NEW object, and the line itself documents what is
// removed. (If a linter complains about the unused variables, enable its
// "ignore rest siblings" option.)
function withoutSecrets(user) {
  const { password, token, ...safeUser } = user;
  return safeUser;
}

// Exercise 4
// WHY: objects don't have filter/map, but their entries (an array) do.
// Filter first, then convert, then turn the pairs back into an object.
function slowTestsInSeconds(durations, limitMs) {
  return Object.fromEntries(
    Object.entries(durations)
      .filter(([, ms]) => ms > limitMs)
      .map(([name, ms]) => [name, ms / 1_000]),
  );
}

// Exercise 5
// WHY: structuredClone copies every level, so changing the clone can never
// leak into the original. Nested spreads work too, but you must spread EVERY
// level on the path you change:
//   return { ...config, use: { ...config.use, viewport: { ...config.use.viewport, width } } };
function withViewportWidth(config, width) {
  const copy = structuredClone(config);
  copy.use.viewport.width = width;
  return copy;
}

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. b's value. Spread copies left to right, so the last one wins.
//   Q2. `in` also finds INHERITED properties (like 'toString').
//       Object.hasOwn only checks the object's own properties.
//   Q3. Spread is shallow, so `local.use` IS `sharedConfig.use`. Changing it
//       changes everyone's config. Fix: copy the path you change,
//       { ...sharedConfig, use: { ...sharedConfig.use, headless: false } },
//       or structuredClone when the config is plain data.
//   Q4. Nested spreads. structuredClone throws on functions (DataCloneError),
//       and JSON round-tripping silently DROPS the callback (and turns Dates
//       into strings). Spread copies the function reference, which is fine.
//   Q5. The order is reversed: defaults come last, so they overwrite every
//       override. Write { ...defaults, ...overrides }.
//
// Review answers:
//   R1. `||` replaces EVERY falsy value, so retries: 0 becomes 3. Use
//       `config.retries ?? 3`, which only replaces null/undefined.
//   R2. Object.entries(obj).filter(...).map(...) and then Object.fromEntries.
//       Filter first so you don't transform values you throw away.
//   R3. No. const stops reassigning `user`; the object itself can still
//       change. Use Object.freeze (shallow) or create new objects instead.
// ----------------------------------------------------------------------------

// ============================== TESTS ======================================
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
