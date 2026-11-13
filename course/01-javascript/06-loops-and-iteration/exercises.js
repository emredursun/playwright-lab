/**
 * ============================================================================
 *  EXERCISES 06 — Loops & Iteration
 * ============================================================================
 *  Run:  node course/01-javascript/06-loops-and-iteration/exercises.js
 *
 *  How to work:
 *    1. Replace each `throw new Error('TODO')` with your solution.
 *    2. Run the file. Every test must pass (✔). Failing tests show what's wrong.
 *    3. Answer the self-check and review questions in your head or on paper.
 *    4. Only THEN compare with solutions.js.
 *
 *  Struggling a bit is good: it's how memory is built. Give each exercise at
 *  least 10 minutes before you peek.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// ----------------------------------------------------------------------------
// Exercise 1 — Numbered list
// Return one string per item, numbered from 1, using for...of and .entries().
// Example: numbered(['a', 'b'])  ->  ['1. a', '2. b']
// ----------------------------------------------------------------------------
function numbered(items) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 2 — Stop at the first failure
// Walk through `results` in order. Count every 'passed' result, ignore
// 'skipped' ones (continue), and stop completely at the first 'failed' one
// (break). Return the number of passed results seen before stopping.
// Example: countPassedUntilFailure(['passed', 'skipped', 'passed', 'failed', 'passed']) -> 2
// ----------------------------------------------------------------------------
function countPassedUntilFailure(results) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 3 — Format an object
// Return one 'key=value' string per property, using Object.entries.
// Example: toQueryParts({ page: 2, sort: 'name' })  ->  ['page=2', 'sort=name']
// ----------------------------------------------------------------------------
function toQueryParts(params) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 4 — Run async steps in order
// `steps` is an array of async functions. Call them ONE AFTER ANOTHER (each must
// finish before the next starts) and return an array of their results.
// Hint: forEach won't work here. Why? (`async`/`await` are explained in
// Lesson 13; here you only need the for...of + await pattern from lesson
// section 7.)
// ----------------------------------------------------------------------------
async function runInOrder(steps) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 5 (bonus, optional topic) — A lazy generator
// Write a generator function `fibonacci()` that yields 0, 1, 1, 2, 3, 5, ...
// forever. The test takes only the first values with iterator helpers.
// Remember Lesson 01: swap two values with destructuring.
// ----------------------------------------------------------------------------
function* fibonacci() {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.js)
//   Q1. Spot the bug:  for (const i in rows) { if (i === 0) skipHeader(); }
//       The header is never skipped. Why?
//   Q2. How do you get both index and value in a for...of loop?
//   Q3. A test does  items.forEach(async (item) => { await page.getByText(item).click(); });
//       and finishes "green" before any click happened. Explain, and fix it.
//   Q4. Why is it safe to call .take(3) on an endless generator?
//   Q5. A colleague writes a while loop that checks a locator's text every
//       100 ms until it changes. What would you suggest instead in Playwright?
//
// Review (earlier lessons)
//   R1. (Lesson 05) Rewrite in your head with guard clauses:
//         if (user) { if (user.isAdmin) { return 'admin'; } else { return 'user'; } } else { return 'guest'; }
//   R2. (Lesson 04) Why is Number.parseFloat('1,234.50') a trap?
//   R3. (Lesson 02) What's the difference between toBe and toEqual?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test('1. numbered: numbers items from 1', () => {
  assert.deepEqual(numbered(['chromium', 'firefox']), ['1. chromium', '2. firefox']);
  assert.deepEqual(numbered([]), []);
});

test('2. countPassedUntilFailure: skips and stops correctly', () => {
  assert.equal(countPassedUntilFailure(['passed', 'skipped', 'passed', 'failed', 'passed']), 2);
  assert.equal(countPassedUntilFailure(['failed', 'passed']), 0);
  assert.equal(countPassedUntilFailure(['passed', 'passed']), 2);
});

test('3. toQueryParts: one key=value string per property', () => {
  assert.deepEqual(toQueryParts({ page: 2, sort: 'name' }), ['page=2', 'sort=name']);
  assert.deepEqual(toQueryParts({}), []);
});

test('4. runInOrder: steps run sequentially', async () => {
  const order = [];
  const step = (name, ms) => async () => {
    order.push(`start ${name}`);
    await delay(ms);
    order.push(`end ${name}`);
    return name;
  };
  const results = await runInOrder([step('slow', 20), step('fast', 1)]);
  assert.deepEqual(results, ['slow', 'fast']);
  assert.deepEqual(order, ['start slow', 'end slow', 'start fast', 'end fast']);
});

test('5. fibonacci (bonus): yields the sequence lazily', () => {
  assert.deepEqual(fibonacci().take(8).toArray(), [0, 1, 1, 2, 3, 5, 8, 13]);
});
