/**
 * ============================================================================
 *  LESSON 18 — Types, Interfaces & Unions
 * ============================================================================
 *  Run:        node course/02-typescript/18-types-interfaces-and-unions/lesson.ts
 *  Practice:   node course/02-typescript/18-types-interfaces-and-unions/exercises.ts
 *  Type-check: npm run course:typecheck   (from the repository root)
 *
 *  After this lesson you can:
 *    1. Describe object shapes with `interface` and `type`, and pick one.
 *    2. Use optional and readonly properties correctly.
 *    3. Combine types with unions (`|`) and intersections / `extends`.
 *    4. Narrow a union with typeof, in, instanceof and equality checks.
 *    5. Model states with discriminated unions and exhaustive switches.
 *    6. Write custom type guards and validate config with `satisfies`.
 *
 *  How to study this file:
 *    - Every example has a numbered PREDICT comment. Write down your guess,
 *      run the file, then check the ANSWER KEY at the bottom.
 *    - Hover over variables in VS Code to watch their type NARROW.
 *    - `// @ts-expect-error` lines are type errors on purpose. The comment
 *      above each one quotes the message the compiler reports.
 * ============================================================================
 */

const section = (title: string): void => console.log(`\n--- ${title} ---`);

// ----------------------------------------------------------------------------
section('1. Object types, optional and readonly properties');
// ----------------------------------------------------------------------------
interface User {
  readonly id: number; // can't be changed after creation
  name: string;
  email: string;
  nickname?: string; // optional: may be missing
}

const ada: User = { id: 1, name: 'Ada', email: 'ada@example.com' };
ada.name = 'Ada Lovelace'; // fine: `name` is not readonly

// Error: Cannot assign to 'id' because it is a read-only property.
// @ts-expect-error -- readonly
ada.id = 2; // NOTE: readonly is compile-time only, so this line still runs!

// Error: Object literal may only specify known properties, but 'emial' does
// not exist in type 'User'. Did you mean to write 'email'?
// (The "excess property check" catches typos in object literals.)
// @ts-expect-error -- typo in a property name
const typo: User = { id: 3, name: 'Linus', email: 'l@example.com', emial: 'x' };

// Our tsconfig enables `exactOptionalPropertyTypes`: an optional property may
// be MISSING, but you can't set it to `undefined` explicitly.
// Error: Type '{ id: number; name: string; email: string; nickname: undefined; }'
// is not assignable to type 'User' with 'exactOptionalPropertyTypes: true'.
// Consider adding 'undefined' to the types of the target's properties.
// @ts-expect-error -- leave it out instead of writing `nickname: undefined`
const noNickname: User = { id: 4, name: 'Grace', email: 'g@example.com', nickname: undefined };

console.log(ada.id, ada.name, ada.nickname ?? '(no nickname)'); // PREDICT #1
void typo;
void noNickname;

// ----------------------------------------------------------------------------
section('2. interface vs type: which one?');
// ----------------------------------------------------------------------------
// Both can describe objects. The differences that matter:
//   interface: object shapes only. Can `extends` other interfaces, classes
//              can `implements` it, and it gives clear error messages.
//   type:      ANY type: unions, tuples, functions, mapped types, literals.
//
// RULE used in this curriculum (also the typescript-eslint default):
//   - `interface` for named object shapes / contracts
//   - `type` for everything else (unions, tuples, functions, utilities)
//   - Small inline object members INSIDE a union may stay as `{ ... }`
//     literals (see TestResult in section 5): naming each one adds noise.
interface Admin extends User {
  permissions: readonly string[];
}
type UserId = User['id']; //                    a type alias for a type
type Formatter = (user: User) => string; //     function type
type Role = 'viewer' | 'editor' | 'admin'; //   union of literals

const root: Admin = { id: 0, name: 'root', email: 'root@example.com', permissions: ['*'] };
const formatUser: Formatter = (user) => `${user.name} <${user.email}>`;
const rootId: UserId = root.id;
const role: Role = 'admin';
console.log(formatUser(root), rootId, role); // PREDICT #2

// ----------------------------------------------------------------------------
section('3. Unions and intersections');
// ----------------------------------------------------------------------------
// Union `A | B`: the value is A OR B. You can only use what they share,
// until you narrow it.
type Id = string | number;

function formatId(id: Id): string {
  // Error: Property 'toUpperCase' does not exist on type 'number'.
  // return id.toUpperCase();
  return String(id);
}
console.log(formatId(42), formatId('abc')); // PREDICT #3

// Intersection `A & B`: the value is A AND B (it has all properties).
interface Timestamped {
  createdAt: Date;
}
type AuditedUser = User & Timestamped;
const audited: AuditedUser = { ...ada, createdAt: new Date('2026-01-01T00:00:00Z') };
console.log(audited.name, audited.createdAt.getUTCFullYear()); // PREDICT #4

// PREFER `interface X extends Y` over `&` for objects: conflicts between
// properties are reported as errors instead of silently producing `never`.

// ----------------------------------------------------------------------------
section('4. Narrowing: proving which member of the union you have');
// ----------------------------------------------------------------------------
function describe(value: string | number | string[] | Date | null): string {
  if (value === null) return 'nothing'; //              equality
  if (typeof value === 'string') return `text(${value.length})`; // typeof
  if (typeof value === 'number') return `number(${value.toFixed(1)})`;
  if (Array.isArray(value)) return `list(${value.join(',')})`; // Array.isArray
  return `date(${value.getUTCFullYear()})`; //        only Date is left!
}
console.log(describe(null), describe('hi'), describe(3), describe(['a', 'b'])); // PREDICT #5
console.log(describe(new Date('2030-06-01T00:00:00Z'))); // PREDICT #6

// `in` narrows by checking whether a property exists:
interface ApiSuccess {
  data: string[];
}
interface ApiFailure {
  error: string;
}
function readResponse(response: ApiSuccess | ApiFailure): string {
  return 'error' in response ? `failed: ${response.error}` : `got ${response.data.length} items`;
}
console.log(readResponse({ data: ['a'] }), '|', readResponse({ error: 'timeout' })); // PREDICT #7

// `instanceof` narrows class instances (very common with errors):
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
console.log(errorMessage(new RangeError('too big')), errorMessage('plain')); // PREDICT #8

// ----------------------------------------------------------------------------
section('5. Discriminated unions + exhaustive switch');
// ----------------------------------------------------------------------------
// Give every member a shared literal property (the "discriminant"). Checking
// it tells TypeScript exactly which member you have.
// This is THE way to model states. No more optional fields that "should" be
// set together.
type TestResult =
  | { status: 'passed'; durationMs: number }
  | { status: 'failed'; durationMs: number; error: string }
  | { status: 'skipped'; reason: string };

function summarize(result: TestResult): string {
  switch (result.status) {
    case 'passed':
      return `✔ ${result.durationMs}ms`;
    case 'failed':
      return `✖ ${result.error}`; // `error` only exists on this member
    case 'skipped':
      return `- skipped: ${result.reason}`;
    default:
      return assertNever(result); // compile error if a case is forgotten
  }
}

// If someone adds { status: 'timedOut' } to TestResult and forgets a case,
// `result` is no longer `never` here, and TypeScript reports an error.
function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${JSON.stringify(value)}`);
}

const results: TestResult[] = [
  { status: 'passed', durationMs: 120 },
  { status: 'failed', durationMs: 900, error: 'Timeout 5000ms exceeded' },
  { status: 'skipped', reason: 'fixme' },
];
console.log(results.map(summarize)); // PREDICT #9

// The same check WITHOUT a helper function: `satisfies never` fails to
// compile as soon as a status is left unhandled.
function shortLabel(result: TestResult): string {
  switch (result.status) {
    case 'passed':
      return 'PASS';
    case 'failed':
      return 'FAIL';
    case 'skipped':
      return 'SKIP';
    default:
      throw new Error(`Unhandled result: ${JSON.stringify(result satisfies never)}`);
  }
}
console.log(results.map(shortLabel).join(' ')); // PREDICT #10

// ----------------------------------------------------------------------------
section('6. Custom type guards (`value is T`)');
// ----------------------------------------------------------------------------
// A function returning `value is T` teaches TypeScript a reusable check.
type FailedResult = Extract<TestResult, { status: 'failed' }>;

function isFailed(result: TestResult): result is FailedResult {
  return result.status === 'failed';
}

// `filter` with a type guard narrows the WHOLE array:
const failures = results.filter(isFailed); // type: FailedResult[]
console.log(failures.map((failure) => failure.error)); // PREDICT #11

// Since TypeScript 5.5, a simple inline callback is INFERRED as a type guard,
// so this narrows too, with no `value is T` written:
const inlineFailures = results.filter((result) => result.status === 'failed'); // FailedResult[]
console.log(inlineFailures.length); // PREDICT #12

// Write an explicit `value is T` guard when the check is reused or exported
// (e.g. from a test-helpers module). CAREFUL: TypeScript trusts your guard. A
// wrong guard creates wrong types, so keep guards tiny and test them.

// ----------------------------------------------------------------------------
section('7. `satisfies`: check a value without losing its exact type');
// ----------------------------------------------------------------------------
// An annotation WIDENS the value to the annotated type:
const routesAnnotated: Record<string, string> = { home: '/', login: '/login' };
console.log(routesAnnotated.loginn); // PREDICT #13

// `satisfies` CHECKS the value against the type but keeps the precise one:
const routes = {
  home: '/',
  login: '/login',
  inventory: '/inventory',
} satisfies Record<string, `/${string}`>; // every path must start with '/'

// Error: Property 'loginn' does not exist on type '{ home: "/"; login: "/login";
// inventory: "/inventory"; }'. Did you mean 'login'?
// Notice the type: `satisfies` kept the exact keys AND the literal values.
// @ts-expect-error -- typo caught, because the keys are known
console.log(routes.loginn); // PREDICT #14
console.log(Object.keys(routes)); // PREDICT #15

// RULE: annotate (`: Type`) when you want the wider type. Use `satisfies`
// for config and lookup objects, so you keep autocomplete on the real keys.

// ----------------------------------------------------------------------------
section('8. Outdated habits you can drop');
// ----------------------------------------------------------------------------
// - One big object type with many optional fields (`error?`, `reason?`) for
//   different states: use a discriminated union.
// - `as SomeType` to "convince" the compiler: narrow, or use `satisfies`.
// - `if (result.error)` checks spread everywhere: switch on the discriminant.
// - Prefixing interfaces with `I` (IUser): just call it `User`.
// - Hand-written `value is T` for every one-off filter: TS 5.5+ infers it.
console.log('Done. Now open exercises.ts and practice from memory!');

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - interface for named object shapes, type for unions/tuples/functions.
 *    - `?` = may be missing. `readonly` = can't be reassigned (compile time).
 *    - Union = one OF. Narrow it with ===, typeof, in, instanceof, isArray.
 *    - Discriminated union + switch + assertNever (or `satisfies never`)
 *      = no forgotten cases.
 *    - `value is T` guards make checks reusable (and narrow filter()).
 *    - `satisfies` validates a value while keeping its precise type.
 *
 *  In Playwright:
 *    interface Credentials { email: string; password: string }
 *    const users = { standard: {...}, locked: {...} } satisfies Record<string, Credentials>;
 *    // Playwright's own types use unions, e.g. `'chromium' | 'firefox' | 'webkit'`.
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1   2 Ada Lovelace (no nickname)  — `readonly` is compile-time only, so
 *        `ada.id = 2` really ran.
 *   #2   root <root@example.com> 0 admin
 *   #3   42 abc
 *   #4   Ada Lovelace 2026
 *   #5   nothing text(2) number(3.0) list(a,b)
 *   #6   date(2030)
 *   #7   got 1 items | failed: timeout
 *   #8   too big plain
 *   #9   [ '✔ 120ms', '✖ Timeout 5000ms exceeded', '- skipped: fixme' ]
 *   #10  PASS FAIL SKIP
 *   #11  [ 'Timeout 5000ms exceeded' ]
 *   #12  1
 *   #13  undefined  — the typo was NOT caught: Record<string, string> allows any key.
 *   #14  undefined  — the type-checker reports it; at runtime it's just missing.
 *   #15  [ 'home', 'login', 'inventory' ]
 * ============================================================================
 */
