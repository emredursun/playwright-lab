/**
 * ============================================================================
 *  EXERCISES 17 — TypeScript Basics
 * ============================================================================
 *  Run:  node course/02-typescript/17-typescript-basics/exercises.ts
 *
 *  How to work:
 *    1. Replace each `throw new Error('TODO')` with your solution.
 *    2. Keep the given signatures. Don't use `any`, `as` casts or `!`.
 *    3. Run the file. Every test must pass (✔). Failing tests show what's wrong.
 *    4. Run `npm run course:typecheck` from the repo root. Types count too:
 *       a solution with type errors is not finished.
 *    5. Answer the self-check and review questions in your head or on paper.
 *    6. Only THEN compare with solutions.ts.
 *
 *  Struggling a bit is good: it's how memory is built. Give each exercise at
 *  least 10 minutes before you peek.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

const BROWSERS = ['chromium', 'firefox', 'webkit'] as const;
type BrowserName = (typeof BROWSERS)[number];

// ----------------------------------------------------------------------------
// Exercise 1 — Validate a string into a literal type
// Return the browser name if `value` is one of BROWSERS, otherwise undefined.
// toBrowserName('firefox') -> 'firefox'      toBrowserName('chrome') -> undefined
// Hint: an array method that returns an element (typed as BrowserName).
// ----------------------------------------------------------------------------
function toBrowserName(value: string): BrowserName | undefined {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 2 — Default parameter with a literal union
// formatDuration(1500)       -> '1500ms'
// formatDuration(1500, 's')  -> '1.5s'
// ----------------------------------------------------------------------------
function formatDuration(ms: number, unit: 'ms' | 's' = 'ms'): string {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 3 — Narrow `unknown`
// Return data.name when `data` is an object with a string `name`.
// Otherwise return 'anonymous'.
// ----------------------------------------------------------------------------
function readName(data: unknown): string {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 4 — Tuples and noUncheckedIndexedAccess
// Return [first, last] of the list, or undefined for an empty list.
// firstAndLast(['a', 'b', 'c']) -> ['a', 'c']    firstAndLast(['a']) -> ['a', 'a']
// ----------------------------------------------------------------------------
function firstAndLast(items: readonly string[]): [first: string, last: string] | undefined {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 5 (bonus) — An assertion function
// Throw a TypeError with the message `${name} must be a string` if `value` is
// not a string. After calling it, TypeScript treats `value` as a string.
// ----------------------------------------------------------------------------
function assertIsString(value: unknown, name: string): asserts value is string {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.ts)
//   Q1. A teammate says: "`node exercises.ts` passed, so my types are fine."
//       Why is that wrong, and which command actually checks the types?
//   Q2. You parse an API response with JSON.parse. Do you type the result as
//       `any`, `unknown`, or the interface you expect? Why?
//   Q3. A pull request adds `enum Browser { Chromium = 'chromium' }`. What do
//       you suggest instead, and what are two reasons?
//   Q4. With `noUncheckedIndexedAccess`, what is the type of `names[0]` when
//       `names` is `string[]`?
//   Q5. Spot the noise. Which annotations would you delete, and which keep?
//         const count: number = items.length;
//         export function total(items: Item[]): number { ... }
//         const results: string[] = [];
//
// Review (spaced repetition: earlier lessons)
//   R1. (Lesson 13) Why does `steps.forEach(async (step) => { await step(); })`
//       not run the steps in order? What do you write instead?
//   R2. (Lesson 09) Why is `Object.hasOwn(table, key)` safer than
//       `key in table` for lookup tables filled from user or API data?
//   R3. (Lesson 02) `options.retries` is 0. What do `options.retries || 3`
//       and `options.retries ?? 3` return, and which one do you want?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
test('1. toBrowserName: accepts known browsers only', () => {
  assert.equal(toBrowserName('firefox'), 'firefox');
  assert.equal(toBrowserName('webkit'), 'webkit');
  assert.equal(toBrowserName('chrome'), undefined);
  assert.equal(toBrowserName(''), undefined);
});

test('2. formatDuration: uses ms by default and converts to seconds', () => {
  assert.equal(formatDuration(1500), '1500ms');
  assert.equal(formatDuration(1500, 's'), '1.5s');
  assert.equal(formatDuration(0, 's'), '0s');
});

test('3. readName: reads a string name from unknown data', () => {
  assert.equal(readName({ name: 'Ada' }), 'Ada');
  assert.equal(readName({ name: 42 }), 'anonymous');
  assert.equal(readName(null), 'anonymous');
  assert.equal(readName('Ada'), 'anonymous');
  assert.equal(readName(JSON.parse('{"name":"Linus"}')), 'Linus');
});

test('4. firstAndLast: returns a tuple or undefined', () => {
  assert.deepEqual(firstAndLast(['a', 'b', 'c']), ['a', 'c']);
  assert.deepEqual(firstAndLast(['a']), ['a', 'a']);
  assert.equal(firstAndLast([]), undefined);
});

test('5. assertIsString (bonus): throws a TypeError for non-strings', () => {
  assert.doesNotThrow(() => assertIsString('ok', 'title'));
  assert.throws(() => assertIsString(42, 'title'), {
    name: 'TypeError',
    message: 'title must be a string',
  });
  assert.throws(() => assertIsString(undefined, 'email'), {
    name: 'TypeError',
    message: 'email must be a string',
  });
});
