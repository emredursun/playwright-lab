/**
 * ============================================================================
 *  SOLUTIONS 16 — Clean Code capstone: characterize, then refactor
 * ============================================================================
 *  Run:  node course/javascript/16-clean-code/solutions.js
 *
 *  Two parts:
 *    - this file: the six characterization tests, written the way a careful
 *      engineer would, and the answers to the self-check questions,
 *    - summary.solution.js: the reference refactor (open it side by side
 *      with legacy-summary.js and compare, step by step).
 *  If your refactor differs but every test is green, it may be just as good.
 * ============================================================================
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { summarizeRun as legacySummarizeRun } from './legacy-summary.js';
// The module under test, and its file (the style checks read its source).
import { summarizeRun } from './summary.solution.js';
const MODULE_FILE = './summary.solution.js';

// A test-data builder (Lesson 21): every test starts from sensible defaults
// and overrides only what matters for THAT test. Deterministic, no randomness.
const result = (overrides) => ({
  title: 'login',
  status: 'passed',
  durationMs: 1_000,
  retries: 0,
  browser: 'chromium',
  ...overrides,
});

// ----------------------------------------------------------------------------
// STEP 1 — Characterization tests
// WHY: each test pins ONE behavior with Arrange / Act / Assert, using the
// builder so only the relevant fields are visible. The values were found by
// RUNNING the legacy code, not by reading it: characterization tests record
// what the code does, not what we think it should do.
// ----------------------------------------------------------------------------
describe('characterization: summarizeRun', () => {
  test('counts passed, flaky (passed after a retry), failed and skipped', () => {
    const results = [
      result({ title: 'a' }),
      result({ title: 'b', retries: 1 }),
      result({ title: 'c', status: 'failed' }),
      result({ title: 'd', status: 'skipped' }),
    ];

    const summary = summarizeRun(results);

    assert.deepEqual(
      [summary.passed, summary.flaky, summary.failed, summary.skipped],
      [1, 1, 1, 1],
    );
  });

  test('pass rate counts flaky tests as passed and ignores skipped ones', () => {
    const results = [
      result({ title: 'a' }),
      result({ title: 'b', retries: 1 }),
      result({ title: 'c', status: 'failed' }),
      result({ title: 'd', status: 'skipped' }),
    ];

    const { passRate } = summarizeRun(results);

    assert.equal(passRate, 66.7); // 2 of 3 executed tests, one decimal
  });

  test('lists failures as "title [browser]" in input order', () => {
    const results = [
      result({ title: 'checkout', status: 'failed', browser: 'firefox' }),
      result({ title: 'login' }),
      result({ title: 'cart', status: 'failed', browser: 'webkit' }),
    ];

    const { failures } = summarizeRun(results);

    assert.deepEqual(failures, ['checkout [firefox]', 'cart [webkit]']);
  });

  test('slowest: executed tests over the limit, slowest first, at most `top`', () => {
    const results = [
      result({ title: 'checkout', durationMs: 6_449 }),
      result({ title: 'fast', durationMs: 4_999 }),
      result({ title: 'skipped', status: 'skipped', durationMs: 9_999 }),
      result({ title: 'cart', durationMs: 7_960 }),
    ];

    const { slowest } = summarizeRun(results, { top: 1 });

    assert.deepEqual(slowest, [{ title: 'cart', seconds: 8 }]);
  });

  test('quirk: slowLimit 0 and top 0 fall back to the defaults (5000 ms, 3)', () => {
    const results = [
      result({ title: 'just-slow', durationMs: 5_001 }),
      result({ title: 'fast', durationMs: 10 }),
    ];

    const { slowest } = summarizeRun(results, { slowLimit: 0, top: 0 });

    // With a REAL limit of 0, `fast` would be listed too.
    assert.deepEqual(slowest, [{ title: 'just-slow', seconds: 5 }]);
  });

  test('quirk: an unknown status such as "timedOut" counts as skipped', () => {
    const results = [result({ status: 'timedOut' })];

    const summary = summarizeRun(results);

    assert.equal(summary.skipped, 1);
    assert.equal(summary.passRate, 0);
  });
});

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. A refactor must not change behavior, and you can't SEE behavior
//       changes without tests. Characterization tests also catch the
//       surprises (the two quirks here) that reading the code misses.
//   Q2. The change itself may be the right FIX, but it isn't a refactor: it
//       changes the output for 0. Finish the refactor with the quirk intact.
//       Then, in a separate commit, change the characterization test to the
//       new intended behavior, make the fix and tell the code's users.
//   Q3. It tests six behaviors at once: when it fails you don't know which
//       one broke, and everything after the failure is never checked. Split
//       it into focused tests (add to cart updates the badge; checkout shows
//       a receipt) and do the setup (logged-in state, a seeded cart) with
//       fixtures or the API instead of the UI.
//   Q4. A branch means the test checks different things on different runs,
//       so a pass doesn't tell you which path was verified. Make the state
//       deterministic (seed data, mock the API) and assert ONE expected
//       outcome.
//   Q5. ESLint catches bugs such as a missing await (typescript-eslint's
//       no-floating-promises, eslint-plugin-playwright's
//       missing-playwright-await). Prettier decides formatting, so nobody
//       argues about it. The human reviewer focuses on design: names, test
//       intent, what is missing.
//
// Review answers:
//   R1. toSorted: the legacy code sorted its OWN array, and a refactor must
//       not start sorting anything the caller owns. toSorted returns a copy.
//   R2. An early return (or throw) for the exceptional case at the top of a
//       function, so the main logic is not nested inside if/else.
//   R3. Let it propagate (rethrow), optionally wrapped with { cause } to add
//       context. Never swallow it.
// ----------------------------------------------------------------------------

// ============================== TESTS ======================================
const sourceOf = (file) =>
  readFileSync(new URL(file, import.meta.url), 'utf8').replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');

const deepFreeze = (value) => {
  for (const inner of Object.values(value)) {
    if (typeof inner === 'object' && inner !== null) deepFreeze(inner);
  }
  return Object.freeze(value);
};

const FIXTURES = [
  {
    name: 'typical run',
    results: [
      result({ title: 'login' }),
      result({ title: 'search', retries: 1, durationMs: 2_400 }),
      result({ title: 'checkout', status: 'failed', durationMs: 6_449, browser: 'firefox' }),
      result({ title: 'profile', status: 'skipped', durationMs: 0 }),
      result({ title: 'cart', status: 'failed', durationMs: 7_960, browser: 'webkit' }),
    ],
  },
  { name: 'empty run', results: [] },
  {
    name: 'only skipped',
    results: [result({ status: 'skipped' }), result({ status: 'skipped', durationMs: 9_000 })],
  },
  {
    name: 'custom limits',
    options: { slowLimit: 1_500, top: 1 },
    results: [
      result({ durationMs: 1_600 }),
      result({ title: 'b', durationMs: 4_000 }),
      result({ title: 'c' }),
    ],
  },
  {
    name: 'quirk: zero options fall back to defaults',
    options: { slowLimit: 0, top: 0 },
    results: [result({ durationMs: 6_000 }), result({ title: 'b', durationMs: 100 })],
  },
  {
    name: 'quirk: unknown status counts as skipped',
    results: [result({ status: 'timedOut', durationMs: 9_000 }), result({ title: 'b' })],
  },
  {
    name: 'ties keep input order, more than top',
    results: [
      result({ title: 'a', durationMs: 6_000 }),
      result({ title: 'b', durationMs: 6_040 }),
      result({ title: 'c', durationMs: 9_000 }),
      result({ title: 'd', durationMs: 7_000 }),
      result({ title: 'e', durationMs: 5_500 }),
    ],
  },
  {
    name: 'null options and flaky with retries',
    options: null,
    results: [result({ retries: 2 }), result({ title: 'b', status: 'failed', retries: 2 })],
  },
];

describe('reference: same behavior as the legacy code', () => {
  for (const { name, results, options } of FIXTURES) {
    test(name, () => {
      const expected = legacySummarizeRun(structuredClone(results), options);
      assert.deepEqual(summarizeRun(structuredClone(results), options), expected);
    });
  }

  test('does not mutate its input', () => {
    const frozen = deepFreeze(structuredClone(FIXTURES[0].results));
    assert.doesNotThrow(() => summarizeRun(frozen));
  });
});

test('style: the refactor targets are met', () => {
  const source = sourceOf(MODULE_FILE);
  assert.doesNotMatch(source, /\bvar\b/, 'STEP 2a: replace var with const (or let)');
  assert.doesNotMatch(source, /[^=!<>]==[^=]|!=[^=]/, 'STEP 2a: use === and !==');
  assert.doesNotMatch(source, /\b5000\b/, 'STEP 2b: name the magic number 5000');
  assert.match(source, /const [A-Z][A-Z0-9_]+ = /, 'STEP 2b: add named UPPER_SNAKE_CASE constants');
  assert.doesNotMatch(source, /for\s*\(\s*(let|var)\s+\w+\s*=/, 'STEP 2c: replace index loops');
  assert.doesNotMatch(source, /['"]\s*\+|\+\s*['"]/, 'STEP 2e: use template literals, not +');
});
