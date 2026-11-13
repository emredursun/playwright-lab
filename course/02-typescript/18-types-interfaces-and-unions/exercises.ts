/**
 * ============================================================================
 *  EXERCISES 18 — Types, Interfaces & Unions
 * ============================================================================
 *  Run:  node course/02-typescript/18-types-interfaces-and-unions/exercises.ts
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

type TestResult =
  | { status: 'passed'; durationMs: number }
  | { status: 'failed'; durationMs: number; error: string }
  | { status: 'skipped'; reason: string };

type FailedResult = Extract<TestResult, { status: 'failed' }>;

// ----------------------------------------------------------------------------
// Exercise 1 — Exhaustive switch on a discriminated union
// passed  -> 'PASSED in 120ms'
// failed  -> 'FAILED: <error>'
// skipped -> 'SKIPPED (<reason>)'
// Add a `default` branch that calls assertNever, so a new status can't be
// forgotten.
// ----------------------------------------------------------------------------
function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${JSON.stringify(value)}`);
}

function describeResult(result: TestResult): string {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 2 — A custom type guard
// isFailed(result) returns true for failed results, and narrows the type.
// failedErrors(results) returns the error messages of the failed results only.
// ----------------------------------------------------------------------------
function isFailed(result: TestResult): result is FailedResult {
  throw new Error('TODO');
}

function failedErrors(results: readonly TestResult[]): string[] {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 3 — Narrow with typeof
// Numbers become '#' + the number padded to 4 digits: 42 -> '#0042'
// Strings become upper-case: 'abc-1' -> 'ABC-1'
// ----------------------------------------------------------------------------
function formatId(id: string | number): string {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 4 — Normalize any thrown value into a message
// Error instance                     -> its message
// string                             -> the string itself
// object with a string `message`     -> that message
// anything else                      -> 'Unknown error'
// ----------------------------------------------------------------------------
function normalizeError(error: unknown): string {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 5 (bonus) — Model shapes as a discriminated union
// Return the area: circle = π·r², rectangle = width·height, square = size².
// Use an exhaustive switch.
// ----------------------------------------------------------------------------
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number }
  | { kind: 'square'; size: number };

function area(shape: Shape): number {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.ts)
//   Q1. You need to describe (a) the options object of a LoginPage
//       constructor, (b) the values 'passed' | 'failed', (c) a callback
//       `(result) => void`. Which keyword do you use for each, and why?
//   Q2. A teammate models results as
//         interface Result { status: string; error?: string; reason?: string }
//       Which bugs does this allow? How would you remodel it?
//   Q3. Why does `assertNever(result)` in a switch's default branch catch
//       forgotten cases at compile time?
//   Q4. You write a `routes` lookup object. When do you annotate it
//       (`const routes: Record<string, string> = ...`) and when do you use
//       `satisfies`? What do you lose with the annotation?
//   Q5. Your test data is typed `readonly`, yet a test still mutates it at
//       runtime. How is that possible, and what would actually prevent it?
//
// Review (spaced repetition: earlier lessons)
//   R1. (Lesson 12) Why throw `new Error('...')` (or a subclass) instead of a
//       plain string?
//   R2. (Lesson 08) What is the difference between `sort()` and `toSorted()`,
//       and which do you prefer in shared test data?
//   R3. (Lesson 17) `node lesson.ts` printed no errors. Does that mean the
//       file has no type errors?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
const sampleResults: TestResult[] = [
  { status: 'passed', durationMs: 120 },
  { status: 'failed', durationMs: 900, error: 'Timeout' },
  { status: 'skipped', reason: 'fixme' },
  { status: 'failed', durationMs: 50, error: 'Element not found' },
];

test('1. describeResult: handles every status', () => {
  assert.deepEqual(sampleResults.map(describeResult), [
    'PASSED in 120ms',
    'FAILED: Timeout',
    'SKIPPED (fixme)',
    'FAILED: Element not found',
  ]);
});

test('2. isFailed + failedErrors: narrow and collect errors', () => {
  assert.equal(isFailed({ status: 'failed', durationMs: 1, error: 'x' }), true);
  assert.equal(isFailed({ status: 'passed', durationMs: 1 }), false);
  assert.deepEqual(failedErrors(sampleResults), ['Timeout', 'Element not found']);
  assert.deepEqual(failedErrors([]), []);
});

test('3. formatId: numbers are padded, strings upper-cased', () => {
  assert.equal(formatId(42), '#0042');
  assert.equal(formatId(12345), '#12345');
  assert.equal(formatId('abc-1'), 'ABC-1');
});

test('4. normalizeError: turns anything into a message', () => {
  assert.equal(normalizeError(new TypeError('bad type')), 'bad type');
  assert.equal(normalizeError('just text'), 'just text');
  assert.equal(normalizeError({ message: 'from object' }), 'from object');
  assert.equal(normalizeError({ message: 42 }), 'Unknown error');
  assert.equal(normalizeError(null), 'Unknown error');
  assert.equal(normalizeError(undefined), 'Unknown error');
});

test('5. area (bonus): computes the area for every shape', () => {
  assert.equal(area({ kind: 'square', size: 3 }), 9);
  assert.equal(area({ kind: 'rectangle', width: 2, height: 5 }), 10);
  assert.equal(area({ kind: 'circle', radius: 1 }), Math.PI);
});
