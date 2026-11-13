/**
 * ============================================================================
 *  SOLUTIONS 06 — Loops & Iteration
 * ============================================================================
 *  Run:  node course/01-javascript/06-loops-and-iteration/solutions.js
 *
 *  Compare these with YOUR solutions. If yours is different but the tests pass,
 *  it may be just as good. Read the WHY comments to see the trade-offs.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// Exercise 1
// WHY: .entries() gives [index, value] pairs, and destructuring names them.
// No manual counter, no off-by-one risk. (In Lesson 08 you'll write this as
// items.map((item, index) => ...), which is even shorter.)
function numbered(items) {
  const lines = [];
  for (const [index, item] of items.entries()) {
    lines.push(`${index + 1}. ${item}`);
  }
  return lines;
}

// Exercise 2
// WHY: `continue` skips one item, `break` ends the loop. The counter must be
// `let` because it really changes (Lesson 01 rule).
function countPassedUntilFailure(results) {
  let passed = 0;
  for (const result of results) {
    if (result === 'skipped') continue;
    if (result === 'failed') break;
    passed += 1;
  }
  return passed;
}

// Exercise 3
// WHY: Object.entries gives only the object's OWN properties, as [key, value]
// pairs, which is exactly what we want here. for...in could also pick up
// inherited keys.
// REAL URLs: this exercise practices loops, but for actual query strings use
// the built-in URLSearchParams. It also ENCODES values (spaces, &, =):
//   new URLSearchParams({ q: 'a&b c' }).toString()  ->  'q=a%26b+c'
function toQueryParts(params) {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    parts.push(`${key}=${value}`);
  }
  return parts;
}

// Exercise 4
// WHY: `await` inside for...of pauses the loop until the step finishes.
// forEach would start every step at once and return before any finished.
async function runInOrder(steps) {
  const results = [];
  for (const step of steps) {
    results.push(await step());
  }
  return results;
}

// Exercise 5
// WHY: a generator only computes the next value when someone asks for it, so
// `while (true)` is fine. Destructuring swaps the pair in one step.
function* fibonacci() {
  let [current, next] = [0, 1];
  while (true) {
    yield current;
    [current, next] = [next, current + next];
  }
}

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. for...in gives property NAMES as STRINGS, so i is '0', never 0, and
//       '0' === 0 is false. Use for (const [index, row] of rows.entries()).
//   Q2. for (const [index, value] of array.entries()) { ... }
//   Q3. forEach doesn't wait for async callbacks: it starts them all and
//       returns immediately, so the test ends first (and the clicks may even
//       run in parallel). Use for (const item of items) { await ...click(); }.
//   Q4. Generators and iterator helpers are lazy. .take(3) asks for three
//       values and then stops, so the endless loop never runs to the end.
//   Q5. Don't hand-roll polling loops: use a web-first assertion like
//       await expect(locator).toHaveText('Done'), which retries until it
//       passes or times out, or expect.poll(...) for non-locator values.
//       (A `while` loop is the right tool when you don't know the number of
//       iterations in ordinary code.)
//
// Review answers
//   R1. if (!user) return 'guest'; if (user.isAdmin) return 'admin'; return 'user';
//   R2. Parsing stops at the first unexpected character, so it returns 1.
//       Remove the thousands separators first (replaceAll(',', '')).
//   R3. toBe checks identity with Object.is (same primitive value or same
//       object); toEqual compares contents deeply.
// ----------------------------------------------------------------------------

// ============================== TESTS ======================================
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
