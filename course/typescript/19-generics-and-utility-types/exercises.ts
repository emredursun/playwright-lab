/**
 * ============================================================================
 *  EXERCISES 19 — Generics & Utility Types
 * ============================================================================
 *  Run:  node course/typescript/19-generics-and-utility-types/exercises.ts
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

// ----------------------------------------------------------------------------
// Exercise 1 — A generic `last`
// Return the last item, or undefined for an empty list.
// last([1, 2, 3]) -> 3 (typed as number | undefined)
// ----------------------------------------------------------------------------
function last<T>(items: readonly T[]): T | undefined {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 2 — Typed property picking
// Return the value of `key` for every item.
// pluck([{ name: 'a', ms: 1 }], 'ms') -> [1] (typed as number[])
// ----------------------------------------------------------------------------
function pluck<T, K extends keyof T>(items: readonly T[], key: K): T[K][] {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 3 — groupBy with a key function
// Group items by the key that `getKey` returns.
// groupBy(['ab', 'c', 'de'], (word) => word.length) -> { 1: ['c'], 2: ['ab', 'de'] }
// Hint: the `??=` operator.
// ----------------------------------------------------------------------------
function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  getKey: (item: T) => K,
): Partial<Record<K, T[]>> {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 4 — Merge overrides into defaults
// Return a NEW object: defaults with overrides applied. Don't mutate either.
// ----------------------------------------------------------------------------
function mergeDefaults<T extends object>(defaults: T, overrides: Partial<T>): T {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 5 (bonus) — Wrap a promise in a Result
// Await `action()`:
//   success -> { ok: true, value }
//   failure -> { ok: false, error: <message> }  (Error -> .message, otherwise String(error))
// ----------------------------------------------------------------------------
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

async function toResult<T>(action: () => Promise<T>): Promise<Result<T>> {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.ts)
//   Q1. Code review: is the generic useful here? What would you write?
//         function logStep<T>(step: T): void { console.log(step); }
//   Q2. When do you have to pass a type argument explicitly, like
//       createQueue<string>()? When should you NOT pass one?
//   Q3. What does `K extends keyof T` mean, and what is `T[K]`?
//   Q4. You write a test-data factory buildUser(overrides). Which utility
//       type do you use for `overrides`? Which one describes "a User without
//       its server-generated id" for a create-user API call?
//   Q5. What does Awaited<ReturnType<typeof loadUser>> resolve to when
//       loadUser returns Promise<User>? When is that useful?
//
// Review (spaced repetition: earlier lessons)
//   R1. (Lesson 18) Why model test results as a discriminated union instead
//       of one interface with optional `error?` and `reason?` fields?
//   R2. (Lesson 11) What is the difference between `#token` and TypeScript's
//       `private token`?
//   R3. (Lesson 13) Three independent API calls seed test data. Do you await
//       them one by one or with Promise.all? Why?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
test('1. last: returns the last item or undefined', () => {
  assert.equal(last([1, 2, 3]), 3);
  assert.equal(last(['only']), 'only');
  assert.equal(last([]), undefined);
});

test('2. pluck: collects one property from every item', () => {
  const runs = [
    { name: 'login', ms: 120 },
    { name: 'checkout', ms: 900 },
  ];
  assert.deepEqual(pluck(runs, 'ms'), [120, 900]);
  assert.deepEqual(pluck(runs, 'name'), ['login', 'checkout']);
  assert.deepEqual(pluck([], 'length'), []);
});

test('3. groupBy: groups items by key', () => {
  assert.deepEqual(
    groupBy(['ab', 'c', 'de'], (word) => word.length),
    { 1: ['c'], 2: ['ab', 'de'] },
  );
  const results = [
    { title: 'a', status: 'passed' },
    { title: 'b', status: 'failed' },
    { title: 'c', status: 'passed' },
  ] as const;
  assert.deepEqual(
    groupBy(results, (result) => result.status),
    {
      passed: [results[0], results[2]],
      failed: [results[1]],
    },
  );
});

test('4. mergeDefaults: applies overrides without mutating', () => {
  const defaults = { timeout: 30_000, headless: true, retries: 0 };
  const overrides = { headless: false, retries: 2 };
  const merged = mergeDefaults(defaults, overrides);
  assert.deepEqual(merged, { timeout: 30_000, headless: false, retries: 2 });
  assert.deepEqual(defaults, { timeout: 30_000, headless: true, retries: 0 });
  assert.deepEqual(overrides, { headless: false, retries: 2 });
  assert.notEqual(merged, defaults);
  assert.notEqual(merged, overrides);

  // Type-level check (`npm run course:typecheck`), never executed:
  // with exactOptionalPropertyTypes, `undefined` can't erase a default.
  const typeOnly = (): void => {
    // @ts-expect-error -- `timeout: undefined` is not a valid override
    mergeDefaults(defaults, { timeout: undefined });
  };
  void typeOnly;
});

test('5. toResult (bonus): turns success and failure into a Result', async () => {
  assert.deepEqual(await toResult(async () => 42), { ok: true, value: 42 });
  assert.deepEqual(
    await toResult(async () => {
      throw new Error('network down');
    }),
    { ok: false, error: 'network down' },
  );
  assert.deepEqual(await toResult(() => Promise.reject('plain reason')), {
    ok: false,
    error: 'plain reason',
  });
});
