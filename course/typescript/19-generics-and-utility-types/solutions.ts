/**
 * ============================================================================
 *  SOLUTIONS 19 — Generics & Utility Types
 * ============================================================================
 *  Run:  node course/typescript/19-generics-and-utility-types/solutions.ts
 *
 *  Compare these with YOUR solutions. If yours is different but the tests pass
 *  AND `npm run course:typecheck` reports no errors, it may be just as good.
 *  Read the WHY comments to see the trade-offs.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// Exercise 1
// WHY: `at(-1)` reads from the end and already returns `T | undefined`,
// which matches the signature exactly. No index math needed.
function last<T>(items: readonly T[]): T | undefined {
  return items.at(-1);
}

// Exercise 2
// WHY: `item[key]` has type T[K] because K is constrained to keyof T, so
// the result type follows the key: 'ms' -> number[], 'name' -> string[].
function pluck<T, K extends keyof T>(items: readonly T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

// Exercise 3
// WHY: `groups[key] ??= []` creates the array on first use and returns it,
// so we can push in the same expression. The return type is Partial because
// a key only exists if at least one item produced it.
// NOTE: since Node 21 / ES2024 there's a built-in Object.groupBy(items, getKey),
// and course/tsconfig.json includes the ES2024 lib so it type-checks.
// Prefer it in real code. Writing it once yourself shows how it works.
function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  getKey: (item: T) => K,
): Partial<Record<K, T[]>> {
  const groups: Partial<Record<K, T[]>> = {};
  for (const item of items) {
    (groups[getKey(item)] ??= []).push(item);
  }
  return groups;
}

// Exercise 4
// WHY: spreading into a new literal copies `defaults` first, then lets
// `overrides` win. Partial<T> lets callers pass only the keys they change,
// and exactOptionalPropertyTypes stops `{ timeout: undefined }` from
// erasing a default.
function mergeDefaults<T extends object>(defaults: T, overrides: Partial<T>): T {
  return { ...defaults, ...overrides };
}

// Exercise 5
// WHY: the generic T flows from the action to the Result, so
// toResult(async () => 42) is Promise<Result<number>>. The caller then HAS to
// check `ok` before reading `value` (the same pattern as Lesson 18).
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

async function toResult<T>(action: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, value: await action() };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. No. T is used only once, so it connects nothing: it's `unknown` in
//       disguise. Write `function logStep(step: unknown): void`. A generic
//       earns its place when it links input to output (first<T>(T[]): T).
//   Q2. When TypeScript has nothing to infer T from: no arguments use it, or
//       you are creating an empty container (new Map<string, number>()).
//       Don't pass one when it would be inferred anyway, e.g.
//       page.evaluate(() => window.scrollY) is already Promise<number>.
//   Q3. K must be one of the keys of T (a union like 'name' | 'ms'). T[K] is
//       an indexed access type: the type of the property K on T.
//   Q4. Partial<TestUser> for overrides (each test passes only what matters).
//       Omit<User, 'id'> for the create payload: the server assigns the id.
//   Q5. User. ReturnType gives Promise<User>, and Awaited unwraps the Promise.
//       Useful when a helper's result type isn't exported: you derive it
//       instead of writing (and maintaining) a duplicate interface.
//
// Review answers
//   R1. The union makes impossible states impossible to write (a passed
//       result with an error), and narrowing on `status` tells TypeScript
//       which fields exist. Optional fields force `if (result.error)` checks
//       everywhere and allow typos to slip through.
//   R2. `#token` is a JavaScript private field: hidden at RUNTIME too (not in
//       Object.keys, not accessible from outside). TypeScript's `private` is
//       only checked at compile time and is a normal property at runtime.
//   R3. Promise.all: independent calls can run in parallel, so setup takes
//       as long as the slowest call instead of the sum. Await one by one only
//       when a call needs the previous result (e.g. create user, then order).
// ----------------------------------------------------------------------------

// ============================== TESTS ======================================
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
