/**
 * ============================================================================
 *  EXERCISES 16 — Clean Code capstone: characterize, then refactor
 * ============================================================================
 *  Run:  node course/01-javascript/16-clean-code/exercises.js
 *
 *  The situation (it WILL happen to you in a real framework):
 *    summary.js is a messy test-results summarizer. Other code depends on its
 *    exact output. Your job is to make it clean WITHOUT changing what it does.
 *    legacy-summary.js is an untouched copy of the original, for reference.
 *
 *  How to work:
 *    STEP 1 — Characterize. Before touching summary.js, fill in the six
 *             characterization tests below. They pin down what the code does
 *             TODAY, including its odd corners. Run the file: your tests must
 *             pass against the messy code.
 *    STEP 2 — Refactor summary.js in SMALL steps. Run this file after each:
 *               a. var -> const (let only if needed), == -> ===
 *               b. name the magic numbers (5000, 3, 1000...) as constants
 *               c. replace the index loops with filter / map / reduce
 *               d. extract small, pure, well-named helpers
 *               e. template literals instead of string concatenation
 *    STEP 3 — Done when every test is green: your characterization tests,
 *             the reference tests (same output as the legacy code on many
 *             inputs) and the style checks.
 *
 *  Watch out: two quirks are pinned ON PURPOSE (0 falls back to the default,
 *  and unknown statuses count as skipped). A refactor keeps them. Fixing them
 *  is a separate, deliberate change with its own test.
 *
 *  Struggling a bit is good: it's how memory is built. Give each step at
 *  least 10 minutes before you peek at solutions.js and summary.solution.js.
 * ============================================================================
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { summarizeRun as legacySummarizeRun } from './legacy-summary.js';
// The module under test, and its file (the style checks read its source).
import { summarizeRun } from './summary.js';
const MODULE_FILE = './summary.js';

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
// STEP 1 — Characterization tests (YOU write these)
// Use Arrange / Act / Assert. One behavior per test. Run the CURRENT code to
// discover the real values, then pin them with assert.equal / deepEqual.
// ----------------------------------------------------------------------------
describe('characterization: summarizeRun', () => {
  test('counts passed, flaky (passed after a retry), failed and skipped', () => {
    // Arrange: a few results with different statuses and retries
    // Act:     const summary = summarizeRun(results);
    // Assert:  each count
    throw new Error('TODO: write this characterization test');
  });

  test('pass rate counts flaky tests as passed and ignores skipped ones', () => {
    throw new Error('TODO: write this characterization test');
  });

  test('lists failures as "title [browser]" in input order', () => {
    throw new Error('TODO: write this characterization test');
  });

  test('slowest: executed tests over the limit, slowest first, at most `top`', () => {
    throw new Error('TODO: write this characterization test');
  });

  test('quirk: slowLimit 0 and top 0 fall back to the defaults (5000 ms, 3)', () => {
    throw new Error('TODO: write this characterization test');
  });

  test('quirk: an unknown status such as "timedOut" counts as skipped', () => {
    throw new Error('TODO: write this characterization test');
  });
});

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.js)
//   Q1. Why write characterization tests BEFORE refactoring, even for code
//       you think you understand?
//   Q2. During the refactor you notice `opts.slowLimit || 5000` and change it
//       to `?? 5_000`. A reference test fails. Was the change wrong? What is
//       the right way to make it?
//   Q3. A Playwright test does: log in, add to cart, check the badge, check
//       out, check the receipt, log out. What's wrong with it as ONE test,
//       and how would you split it?
//   Q4. Why should a test never contain `if` / `else`?
//   Q5. ESLint, Prettier or a code review: who should catch a missing
//       `await`, who should decide quotes and spacing, and what's left for
//       the human reviewer?
//
// Review (earlier lessons):
//   R1. (Lesson 08) toSorted vs sort: which one did the refactor need, and why?
//   R2. (Lesson 05) What is a guard clause, and how does it flatten nesting?
//   R3. (Lesson 12) What should a function do with an error it can't handle?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
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
