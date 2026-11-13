/**
 * ============================================================================
 *  SOLUTIONS 18 — Types, Interfaces & Unions
 * ============================================================================
 *  Run:  node course/02-typescript/18-types-interfaces-and-unions/solutions.ts
 *
 *  Compare these with YOUR solutions. If yours is different but the tests pass
 *  AND `npm run course:typecheck` reports no errors, it may be just as good.
 *  Read the WHY comments to see the trade-offs.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

type TestResult =
  | { status: 'passed'; durationMs: number }
  | { status: 'failed'; durationMs: number; error: string }
  | { status: 'skipped'; reason: string };

type FailedResult = Extract<TestResult, { status: 'failed' }>;

// Exercise 1
// WHY: inside each `case`, TypeScript knows the exact member, so `error` and
// `reason` are available without checks. The default branch only compiles
// while every status is handled.
function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${JSON.stringify(value)}`);
}

function describeResult(result: TestResult): string {
  switch (result.status) {
    case 'passed':
      return `PASSED in ${result.durationMs}ms`;
    case 'failed':
      return `FAILED: ${result.error}`;
    case 'skipped':
      return `SKIPPED (${result.reason})`;
    default:
      return assertNever(result);
  }
}

// Exercise 2
// WHY: the guard is a one-line check on the discriminant. Passing it to
// `filter` narrows the array to FailedResult[], so `.error` is safe in map.
// Since TypeScript 5.5, `results.filter((r) => r.status === 'failed')`
// narrows on its own (an inferred type predicate). The named guard still
// pays off when the check is reused, as here.
function isFailed(result: TestResult): result is FailedResult {
  return result.status === 'failed';
}

function failedErrors(results: readonly TestResult[]): string[] {
  return results.filter(isFailed).map((result) => result.error);
}

// Exercise 3
// WHY: `typeof` narrows the union, so each branch gets the methods of its
// own type: padStart for strings made from numbers, toUpperCase for strings.
function formatId(id: string | number): string {
  if (typeof id === 'number') {
    return `#${String(id).padStart(4, '0')}`;
  }
  return id.toUpperCase();
}

// Exercise 4
// WHY: `throw` can throw ANYTHING, so caught values are `unknown`. Check the
// most specific case first (instanceof Error), then the looser ones.
function normalizeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return 'Unknown error';
}

// Exercise 5
// WHY: `kind` is the discriminant. Adding a new shape later will make the
// `assertNever` line fail to compile until you handle it.
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number }
  | { kind: 'square'; size: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'square':
      return shape.size ** 2;
    default:
      return assertNever(shape);
  }
}

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. (a) `interface LoginPageOptions { ... }`: a named object shape.
//       (b) `type Status = 'passed' | 'failed'`: a union needs `type`.
//       (c) `type OnResult = (result: TestResult) => void`: function types
//       are written with `type`. This matches the typescript-eslint default.
//   Q2. It allows impossible states: `status: 'pased'` (typo), a passed
//       result WITH an error, or a failed result WITHOUT one, and every
//       reader has to guess which fields go together. Remodel it as a
//       discriminated union: { status: 'passed'; ... } | { status: 'failed';
//       error: string } | { status: 'skipped'; reason: string }.
//   Q3. After all cases, the remaining type is `never`. If a case is missing,
//       the leftover member is not assignable to `never`, so the call fails
//       to compile.
//   Q4. Annotate when you WANT the wider type (e.g. routes are added at
//       runtime). Use `satisfies` for fixed config/lookup objects: it checks
//       the shape but keeps the exact keys and literal values. With the
//       annotation you lose autocomplete, and typos like `routes.loginn`
//       compile (they just return undefined).
//   Q5. `readonly` exists only at compile time: code with a wider type, a
//       cast, or plain JavaScript can still write to it. Object.freeze (or a
//       deep-freeze helper, Lesson 01) protects it at runtime. Better still:
//       build fresh data per test with a factory (Lesson 20).
//
// Review answers
//   R1. Error objects carry a stack trace, a `name` for instanceof checks,
//       and an optional `cause`. A thrown string has none of that, so test
//       reports show no location and catch blocks can't tell errors apart.
//   R2. `sort()` sorts IN PLACE (it mutates the original array);
//       `toSorted()` returns a new sorted copy. Prefer `toSorted()` for
//       shared data, so one test can't change another test's input.
//   R3. No. Node only strips the types. Run `npm run course:typecheck`.
// ----------------------------------------------------------------------------

// ============================== TESTS ======================================
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
