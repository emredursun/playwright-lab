/**
 * ============================================================================
 *  LESSON 17 — TypeScript Basics
 * ============================================================================
 *  Run:        node course/typescript/17-typescript-basics/lesson.ts
 *  Practice:   node course/typescript/17-typescript-basics/exercises.ts
 *  Type-check: npm run course:typecheck   (from the repository root)
 *
 *  After this lesson you can:
 *    1. Explain what TypeScript checks and when (hint: NOT at runtime).
 *    2. Decide when to write a type and when to let TypeScript infer it.
 *    3. Use primitive, array, tuple, literal and union types.
 *    4. Choose `unknown` over `any`, and `as const` over `enum`.
 *    5. Type function parameters, return values, optional and default params.
 *
 *  How to study this file:
 *    - Every example has a numbered PREDICT comment. Write down your guess,
 *      run the file, then check the ANSWER KEY at the bottom.
 *    - Open it in VS Code and HOVER over variables to see their inferred types.
 *    - Lines marked `// @ts-expect-error` are type errors on purpose. The
 *      comment above each one quotes the message the compiler reports.
 * ============================================================================
 */
// A type-only import: it exists for the type checker and disappears when the
// file runs (see section 8).
import type { TestContext } from 'node:test';

const section = (title: string): void => console.log(`\n--- ${title} ---`);

// ----------------------------------------------------------------------------
section('1. Why TypeScript: types are checked BEFORE the code runs');
// ----------------------------------------------------------------------------
// TypeScript = JavaScript + type annotations. The editor and the `tsc`
// compiler read the annotations and warn you about mistakes while you type.
// Node removes ("strips") the annotations and runs plain JavaScript.
// Mental model: types are a SPELL CHECKER for code, not a runtime guard.
// That is why this course has TWO feedback loops: run the file (behavior)
// AND run `npm run course:typecheck` (types).

function add(a: number, b: number): number {
  return a + b;
}
console.log(add(2, 3)); // PREDICT #1

// Error: Argument of type 'string' is not assignable to parameter of type 'number'.
// @ts-expect-error -- passing a string on purpose
console.log(add('2', 3)); // PREDICT #2

// Lesson: a type error is a bug found early. Never ignore one. Fix it.

// ----------------------------------------------------------------------------
section('2. Inference first, annotations at the boundaries');
// ----------------------------------------------------------------------------
// TypeScript INFERS types from values. Hover over these names:
const browserName = 'chromium'; // type: 'chromium'  (a const can never change)
let retries = 2; //                type: number      (a let can change)
retries += 1;
const tags = ['@smoke', '@login']; // type: string[]

// AVOID noise that repeats what is obvious:
//   const count: number = 5;
// PREFER explicit types where inference can't help or where they document
// a contract:
//   - function parameters (always required)
//   - return types of exported/public functions
//   - empty collections that will be filled later
const failedTests: string[] = [];
failedTests.push('checkout fails');
console.log(browserName, retries, tags.length, failedTests); // PREDICT #3

// ----------------------------------------------------------------------------
section('3. Primitive types');
// ----------------------------------------------------------------------------
const title: string = 'login works';
const durationMs: number = 1_250;
const isFlaky: boolean = false;
const bigCounter: bigint = 9_007_199_254_740_993n;
const missing: null = null;
const notSet: undefined = undefined;
console.log(typeof title, typeof durationMs, typeof isFlaky, typeof bigCounter); // PREDICT #4
console.log(missing, notSet); // PREDICT #5

// Use lowercase `string`, `number`, `boolean`.
// AVOID the wrapper types `String`, `Number`, `Boolean`, `Object`, `Function`.
// They are almost never what you mean.

// ----------------------------------------------------------------------------
section('4. Arrays, readonly arrays and tuples');
// ----------------------------------------------------------------------------
const durations: number[] = [120, 340, 90];
const projects: readonly string[] = ['chromium', 'firefox'];

// Error: Property 'push' does not exist on type 'readonly string[]'.
// (Wrapped in a function we never call, so the array stays unchanged.)
const neverCalled = (): void => {
  // @ts-expect-error -- readonly arrays have no mutating methods
  projects.push('webkit');
};

// Our tsconfig enables `noUncheckedIndexedAccess`: reading by index may hit a
// hole, so the type is `string | undefined`, and TypeScript makes you handle it.
const firstProject = projects[0]; // type: string | undefined
console.log(firstProject?.toUpperCase() ?? 'none'); // PREDICT #6

// A tuple is a fixed-length array where each position has its own type.
// Labels make tuples self-documenting:
const slowest: [name: string, ms: number] = ['checkout', 4_200];
const [slowName, slowMs] = slowest;
console.log(`${slowName} took ${slowMs}ms`, durations.length); // PREDICT #7

// BEST PRACTICE: prefer `readonly T[]` for data you only read. More than 2-3
// tuple positions? Use an object with named properties instead (Lesson 18).

// ----------------------------------------------------------------------------
section('5. any vs unknown');
// ----------------------------------------------------------------------------
// `any` switches the type checker OFF. Mistakes slip through to runtime.
function parseLoose(json: string): any {
  return JSON.parse(json);
}
try {
  parseLoose('{"name":"ada"}').nmae.toUpperCase(); // typo! compiles anyway
} catch (error) {
  // In strict mode a caught error is `unknown`, so we narrow it first.
  console.log(error instanceof Error ? error.name : 'unknown error'); // PREDICT #8
}

// `unknown` means "could be anything, prove it before you use it".
const data: unknown = JSON.parse('{"name":"ada"}');

// Error: 'data' is of type 'unknown'.
// @ts-expect-error -- must narrow before accessing properties
console.log(data.name); // PREDICT #9

if (typeof data === 'object' && data !== null && 'name' in data && typeof data.name === 'string') {
  console.log(data.name.toUpperCase()); // PREDICT #10
}
// RULE: never use `any`. Use `unknown` for untrusted data (JSON, API
// responses, caught errors) and narrow it. Lesson 20 shows this for API
// responses, whose `.json()` method is typed `any` by Playwright.

// ----------------------------------------------------------------------------
section('6. Literal types, unions and `as const`');
// ----------------------------------------------------------------------------
// A literal type allows only one exact value. A union (`|`) combines types.
type BrowserName = 'chromium' | 'firefox' | 'webkit';

function launch(name: BrowserName): string {
  return `Launching ${name}`;
}
console.log(launch('firefox')); // PREDICT #11

// Error: Argument of type '"chrome"' is not assignable to parameter of type 'BrowserName'.
// @ts-expect-error -- typo caught at compile time
launch('chrome');

// AVOID enums. They generate extra runtime code, behave differently from
// the rest of TypeScript, and Node's type stripping can't even run them.
//   enum Status { Passed = 'passed', Failed = 'failed' }   // outdated
// PREFER an `as const` object. You get the runtime values AND the union type
// from one source:
const TestStatus = {
  Passed: 'passed',
  Failed: 'failed',
  Skipped: 'skipped',
} as const;
type TestStatus = (typeof TestStatus)[keyof typeof TestStatus]; // 'passed' | 'failed' | 'skipped'

const status: TestStatus = TestStatus.Failed;
console.log(status, Object.values(TestStatus)); // PREDICT #12

// The same trick works for lists:
const BROWSERS = ['chromium', 'firefox', 'webkit'] as const;
type Browser = (typeof BROWSERS)[number]; // 'chromium' | 'firefox' | 'webkit'
const defaultBrowser: Browser = BROWSERS[0];
console.log(defaultBrowser); // PREDICT #13

// ----------------------------------------------------------------------------
section('7. Functions: optional, default, rest, void and never');
// ----------------------------------------------------------------------------
// Default parameter: its type is inferred from the default value.
function greet(name: string, greeting = 'Hello'): string {
  return `${greeting}, ${name}!`;
}

// Optional parameter (`?`): may be left out, so inside it is `string | undefined`.
function formatTitle(title: string, tag?: string): string {
  return tag ? `${title} ${tag}` : title;
}

// Rest parameters are typed as an array.
function sum(...values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

// `void`: the function returns nothing useful.
function logResult(message: string): void {
  console.log(`[result] ${message}`);
}

// `never`: the function NEVER returns normally (it throws or loops forever).
function fail(message: string): never {
  throw new Error(message);
}

console.log(greet('Ada'), greet('Linus', 'Hi')); // PREDICT #14
console.log(formatTitle('login'), '|', formatTitle('login', '@smoke')); // PREDICT #15
console.log(sum(1, 2, 3)); // PREDICT #16
logResult('3 passed'); // PREDICT #17
try {
  fail('boom');
} catch (error) {
  console.log(error instanceof Error ? error.message : error); // PREDICT #18
}

// BEST PRACTICE: annotate the return type of functions other code depends
// on. It locks in the contract and gives clearer errors at the definition.

// ----------------------------------------------------------------------------
section('8. Type-only imports');
// ----------------------------------------------------------------------------
// `import type { TestContext } from 'node:test'` (top of this file) imports
// ONLY a type. It is erased at runtime, so it never loads any code.
// With `verbatimModuleSyntax` (see course/tsconfig.json) TypeScript FORCES
// you to mark type-only imports. That is required when Node strips types,
// because a plain `import { TestContext }` would ask the module at runtime
// for an export that doesn't exist.
// Mixed imports mark the type inline:  import { test, type Page } from '@playwright/test';
function describeContext(context: TestContext): string {
  return `running "${context.name}"`;
}
console.log(typeof describeContext); // PREDICT #19

// ----------------------------------------------------------------------------
section('9. Outdated habits you can drop');
// ----------------------------------------------------------------------------
// - `enum` and `namespace`: use `as const` objects/unions and ES modules.
// - `any` everywhere: use `unknown` and narrow, or write the real type.
// - `/// <reference path="..." />`: use `import` / `import type`.
// - Non-null assertions (`value!`) to silence errors: handle the
//   `undefined` case with `?.`, `??` or an `if` instead.
// - Turning `strict` off: always keep strict mode on.
// - Trusting "it runs" as proof the types are right: run the type-checker.
console.log('Done. Now open exercises.ts and practice from memory!');
void neverCalled; // mark as intentionally unused

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - TypeScript checks types BEFORE runtime. Node only strips them.
 *    - Let TypeScript infer locals. Annotate parameters, public return types,
 *      and empty collections.
 *    - `unknown` + narrowing beats `any`. `as const` + unions beat `enum`.
 *    - `readonly T[]` for data you only read. With `noUncheckedIndexedAccess`,
 *      `array[i]` is `T | undefined`.
 *    - `void` = returns nothing. `never` = never returns.
 *
 *  In Playwright:
 *    import { test, expect, type Page } from '@playwright/test';
 *    async function login(page: Page, email: string): Promise<void> { ... }
 *    // Inside `defineConfig({ projects: [{ name: 'chromium' }] })` every
 *    // option is type-checked, so a typo in an option name shows up in your
 *    // editor at once. (A plain object without defineConfig is NOT checked.)
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1   5
 *   #2   23  — the type error is compile-time only. Node stripped the types
 *            and plain JavaScript concatenated '2' + 3.
 *   #3   chromium 3 2 [ 'checkout fails' ]
 *   #4   string number boolean bigint
 *   #5   null undefined
 *   #6   CHROMIUM
 *   #7   checkout took 4200ms 3
 *   #8   TypeError  — `any` let the typo `nmae` compile; it crashed at runtime.
 *   #9   ada  — still runs: the error is reported by the type-checker only.
 *   #10  ADA  — after narrowing, TypeScript KNOWS `data.name` is a string.
 *   #11  Launching firefox
 *   #12  failed [ 'passed', 'failed', 'skipped' ]
 *   #13  chromium
 *   #14  Hello, Ada! Hi, Linus!
 *   #15  login | login @smoke
 *   #16  6
 *   #17  [result] 3 passed
 *   #18  boom
 *   #19  function
 * ============================================================================
 */
