/**
 * ============================================================================
 *  SOLUTIONS 17 — TypeScript Basics
 * ============================================================================
 *  Run:  node course/typescript/17-typescript-basics/solutions.ts
 *
 *  Compare these with YOUR solutions. If yours is different but the tests pass
 *  AND `npm run course:typecheck` reports no errors, it may be just as good.
 *  Read the WHY comments to see the trade-offs.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

const BROWSERS = ['chromium', 'firefox', 'webkit'] as const;
type BrowserName = (typeof BROWSERS)[number];

// Exercise 1
// WHY: `BROWSERS.includes(value)` does NOT compile, because `includes` on a
// readonly tuple of literals only accepts those literals, not any string.
// `find` compares each element with `value` and returns the ELEMENT, which is
// already typed as BrowserName. That gives us the right type without a cast.
function toBrowserName(value: string): BrowserName | undefined {
  return BROWSERS.find((browser) => browser === value);
}

// Exercise 2
// WHY: the union 'ms' | 's' means TypeScript rejects typos like 'sec'.
// The default value keeps the common call short.
function formatDuration(ms: number, unit: 'ms' | 's' = 'ms'): string {
  return unit === 's' ? `${ms / 1_000}s` : `${ms}ms`;
}

// Exercise 3
// WHY: each check narrows the type one step further:
// unknown -> object | null -> object -> object & { name: unknown } -> string.
// `typeof null === 'object'` is why the `!== null` check matters.
function readName(data: unknown): string {
  if (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    typeof data.name === 'string'
  ) {
    return data.name;
  }
  return 'anonymous';
}

// Exercise 4
// WHY: with noUncheckedIndexedAccess, `items[0]` and `items.at(-1)` are
// `string | undefined`. Checking both values (instead of `items.length`)
// lets TypeScript narrow them to `string`, with no `!` needed.
function firstAndLast(items: readonly string[]): [first: string, last: string] | undefined {
  const first = items[0];
  const last = items.at(-1);
  if (first === undefined || last === undefined) {
    return undefined;
  }
  return [first, last];
}

// Exercise 5
// WHY: `asserts value is string` tells TypeScript: "if this function returns,
// `value` is a string". Throw TypeError, the standard error for wrong types.
function assertIsString(value: unknown, name: string): asserts value is string {
  if (typeof value !== 'string') {
    throw new TypeError(`${name} must be a string`);
  }
}

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. Node only STRIPS the types (erases them) and runs the JavaScript
//       that's left, so passing tests prove behavior, not types. Run
//       `npm run course:typecheck` (tsc) or look at your editor's errors.
//   Q2. `unknown`. `any` turns type checking off, so typos and wrong shapes
//       crash at runtime. Annotating the expected interface directly is a
//       lie: nothing checked it. `unknown` forces you to validate (narrow, a
//       type guard, or a schema library) before using it. Lesson 20 shows it.
//   Q3. An `as const` object plus a derived union type:
//         const Browser = { Chromium: 'chromium' } as const;
//         type Browser = (typeof Browser)[keyof typeof Browser];
//       Reasons: enums generate runtime code and can't run with Node's type
//       stripping (erasableSyntaxOnly flags them), and plain string unions
//       work with JSON, config files and Playwright's own APIs.
//   Q4. `string | undefined`. Reading an index might miss, so TypeScript
//       makes you handle the `undefined` case.
//   Q5. Delete `: number` on `count` (inferred from `items.length`). Keep
//       the parameter type (always required) and the return type of the
//       EXPORTED function (it documents the contract). Keep `string[]` on
//       the empty array: there is nothing to infer from yet. (In strict mode
//       TypeScript lets `[]` "evolve" from later pushes, but an explicit type
//       states the intent and rejects pushing the wrong kind of value.)
//
// Review answers
//   R1. forEach ignores the promises the async callback returns, so every
//       step starts at once and nothing waits. Use `for (const step of steps)
//       { await step(); }` for order, or `await Promise.all(...)` when the
//       steps are independent and may run in parallel.
//   R2. `in` also finds INHERITED keys like 'toString' or 'constructor', so
//       a lookup for such a key returns a function instead of "missing".
//       Object.hasOwn checks only the object's own keys.
//   R3. `||` returns 3 (0 is falsy, so it's replaced). `??` returns 0 (it
//       only replaces null/undefined). You want `??`: 0 retries is a valid,
//       deliberate choice.
// ----------------------------------------------------------------------------

// ============================== TESTS ======================================
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
