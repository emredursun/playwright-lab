/**
 * ============================================================================
 *  LESSON 19 — Generics & Utility Types
 * ============================================================================
 *  Run:        node course/typescript/19-generics-and-utility-types/lesson.ts
 *  Practice:   node course/typescript/19-generics-and-utility-types/exercises.ts
 *  Type-check: npm run course:typecheck   (from the repository root)
 *
 *  After this lesson you can:
 *    1. Write generic functions and types that keep type information.
 *    2. Restrict generics with `extends` constraints.
 *    3. Derive types from values with typeof, keyof and indexed access.
 *    4. Use the built-in utility types: Partial, Required, Readonly, Pick,
 *       Omit, Record, Extract, Exclude, NonNullable, ReturnType, Parameters,
 *       Awaited.
 *    5. Read and write simple mapped types and template literal types.
 *    6. Use modern generic tools: `const` type parameters and NoInfer.
 *
 *  How to study this file:
 *    - Every example has a numbered PREDICT comment. Write down your guess,
 *      run the file, then check the ANSWER KEY at the bottom.
 *    - HOVER over every type alias in VS Code. Seeing the resolved type is
 *      the whole point of this lesson.
 *    - `// @ts-expect-error` lines are type errors on purpose. The comment
 *      above each one quotes the message the compiler reports.
 * ============================================================================
 */

const section = (title: string): void => console.log(`\n--- ${title} ---`);

// ----------------------------------------------------------------------------
section('1. Why generics: keep the type that goes in');
// ----------------------------------------------------------------------------
// AVOID: with `any`, the result's type is lost, so typos compile.
function firstAny(items: any[]): any {
  return items[0];
}
const lost = firstAny(['playwright']); // type: any (hover it)

// PREFER a type parameter <T>: "whatever type of items you pass in, you get
// that type back". T is like a function parameter, but for types.
function first<T>(items: readonly T[]): T | undefined {
  return items[0];
}
const word = first(['playwright', 'test']); // type: string | undefined
const count = first([10, 20]); //             type: number | undefined
console.log(word?.toUpperCase(), count, lost); // PREDICT #1

// ----------------------------------------------------------------------------
section('2. Inference vs explicit type arguments');
// ----------------------------------------------------------------------------
// Usually TypeScript infers T from the arguments (as above). When there is
// nothing to infer from, pass the type argument yourself:
interface Queue<T> {
  add(item: T): void;
  next(): T | undefined;
  size(): number;
}

function createQueue<T>(): Queue<T> {
  const items: T[] = [];
  return {
    add: (item) => {
      items.push(item);
    },
    next: () => items.shift(),
    size: () => items.length,
  };
}

const queue = createQueue<string>(); // no arguments -> say what T is
queue.add('login');
queue.add('checkout');

const neverCalled = (): void => {
  // Error: Argument of type 'number' is not assignable to parameter of type 'string'.
  // @ts-expect-error -- the queue only accepts strings
  queue.add(42);
};
console.log(queue.next(), queue.size()); // PREDICT #2

// Same idea with built-ins: new Map<string, number>(), new Set<string>().
const durations = new Map<string, number>([['login', 120]]);
console.log(durations.get('login')); // PREDICT #3

// ----------------------------------------------------------------------------
section('3. Constraints: `T extends Something`');
// ----------------------------------------------------------------------------
// A constraint says "T can be anything, AS LONG AS it has this shape".
function longest<T extends { length: number }>(a: T, b: T): T {
  return b.length > a.length ? b : a;
}
console.log(longest('abc', 'de'), longest([1, 2], [1, 2, 3])); // PREDICT #4

// Error: Argument of type 'number' is not assignable to parameter of type '{ length: number; }'.
// @ts-expect-error -- numbers have no `length`
longest(10, 20);

// `K extends keyof T` = "K must be one of T's keys". The return type T[K]
// is the type of THAT property.
function getProperty<T, K extends keyof T>(object: T, key: K): T[K] {
  return object[key];
}
const testCase = { title: 'login works', retries: 2, tags: ['@smoke'] };
const retries = getProperty(testCase, 'retries'); // type: number
console.log(retries + 1); // PREDICT #5

// Error: Argument of type '"retry"' is not assignable to parameter of type
// '"title" | "retries" | "tags"'.
// @ts-expect-error -- not a key of testCase
getProperty(testCase, 'retry');

// ----------------------------------------------------------------------------
section('4. Types from values: typeof, keyof, indexed access');
// ----------------------------------------------------------------------------
// Write the VALUE once and derive the types from it: one source of truth.
const defaultConfig = { baseURL: 'http://localhost:4200', timeout: 30_000, headless: true };

type Config = typeof defaultConfig; //  { baseURL: string; timeout: number; headless: boolean }
type ConfigKey = keyof Config; //       'baseURL' | 'timeout' | 'headless'
type Timeout = Config['timeout']; //    number

// NOTE: `typeof` in a TYPE position is TypeScript's typeof (it reads a type).
// In a VALUE position it is JavaScript's typeof (it returns a string).
const keys: ConfigKey[] = ['timeout', 'headless'];
const quickTimeout: Timeout = 5_000;
console.log(
  keys.map((key) => `${key}=${defaultConfig[key]}`),
  quickTimeout,
); // PREDICT #6

// ----------------------------------------------------------------------------
section('5. Generic types (with defaults)');
// ----------------------------------------------------------------------------
type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };
interface Paginated<TItem> {
  items: TItem[];
  page: number;
  total: number;
}
interface Box<T = string> {
  value: T;
}

function fetchUsers(shouldFail: boolean): ApiResponse<Paginated<string>> {
  return shouldFail
    ? { ok: false, error: '503 Service Unavailable' }
    : { ok: true, data: { items: ['ada', 'linus'], page: 1, total: 2 } };
}

for (const shouldFail of [false, true]) {
  const response = fetchUsers(shouldFail);
  console.log(response.ok ? response.data.items : response.error); // PREDICT #7 (runs twice)
}

const label: Box = { value: 'uses the default T = string' };
const total: Box<number> = { value: 2 };
console.log(label.value, total.value); // PREDICT #8

// ----------------------------------------------------------------------------
section('6. Built-in utility types');
// ----------------------------------------------------------------------------
interface User {
  id: number;
  name: string;
  email: string;
  role: 'viewer' | 'admin';
}

type NewUser = Omit<User, 'id'>; //                  everything except id
type UserPreview = Pick<User, 'id' | 'name'>; //     only id and name
type UserUpdate = Partial<Omit<User, 'id'>>; //      all optional, id not editable
type FrozenUser = Readonly<User>; //                 every property readonly
type RoleCounts = Record<User['role'], number>; //   { viewer: number; admin: number }
type LaunchOptions = Required<{ headless?: boolean; slowMo?: number }>; // nothing optional anymore
type Name = NonNullable<string | null | undefined>; // string

let nextId = 1;
function createUser(input: NewUser): User {
  return { id: nextId++, ...input };
}
function updateUser(user: User, changes: UserUpdate): User {
  return { ...user, ...changes };
}
async function loadUser(): Promise<User> {
  return createUser({ name: 'Grace', email: 'grace@example.com', role: 'viewer' });
}

type CreateUserResult = ReturnType<typeof createUser>; //         User
type CreateUserArgs = Parameters<typeof createUser>; //           [input: NewUser]
type LoadedUser = Awaited<ReturnType<typeof loadUser>>; //        User (unwrapped from Promise)

const ada = createUser({ name: 'Ada', email: 'ada@example.com', role: 'admin' });
const renamed = updateUser(ada, { name: 'Ada Lovelace' });
const preview: UserPreview = { id: renamed.id, name: renamed.name };
const frozen: FrozenUser = renamed;
const roleCounts: RoleCounts = { viewer: 3, admin: 1 };
const launchOptions: LaunchOptions = { headless: true, slowMo: 0 };
const userName: Name = frozen.name;
const loaded: LoadedUser = await loadUser(); // top-level await works in ES modules
const created: CreateUserResult = loaded;
const args: CreateUserArgs = [{ name: 'Linus', email: 'linus@example.com', role: 'viewer' }];

console.log(preview, ada.name); // PREDICT #9
console.log(roleCounts.viewer + roleCounts.admin, launchOptions.headless, userName); // PREDICT #10
console.log(created.id, created.name, args[0].name); // PREDICT #11

// Error: Property 'admin' is missing in type '{ viewer: number; }' but required in type 'RoleCounts'.
// @ts-expect-error -- Record forces every key to be present
const missingRole: RoleCounts = { viewer: 3 };
void missingRole;

// Extract and Exclude filter the members of a UNION:
type Status = 'passed' | 'failed' | 'skipped' | 'timedOut';
type Problem = Extract<Status, 'failed' | 'timedOut'>; //  'failed' | 'timedOut'  (keep these)
type Fine = Exclude<Status, Problem>; //                   'passed' | 'skipped'    (drop these)
const problems: Problem[] = ['failed', 'timedOut'];
const fine: Fine = 'skipped';
console.log(problems, fine); // PREDICT #12

// ----------------------------------------------------------------------------
section('7. Mapped types: build a type by looping over keys');
// ----------------------------------------------------------------------------
// `[K in keyof T]` loops over the keys of T. Partial is written exactly
// like this:   type Partial<T> = { [K in keyof T]?: T[K] };
type Flags<T> = { [K in keyof T]: boolean };
type Mutable<T> = { -readonly [K in keyof T]: T[K] }; // `-readonly` removes readonly

// `as` renames keys. Here 'timeout' becomes 'getTimeout':
type Getters<T> = { [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K] };

const changedSettings: Flags<Config> = { baseURL: false, timeout: true, headless: false };
const editable: Mutable<FrozenUser> = { ...frozen };
editable.name = 'Countess Ada';
const configGetters: Getters<Pick<Config, 'timeout' | 'headless'>> = {
  getTimeout: () => defaultConfig.timeout,
  getHeadless: () => defaultConfig.headless,
};
console.log(changedSettings.timeout, editable.name, configGetters.getTimeout()); // PREDICT #13

// ----------------------------------------------------------------------------
section('8. Template literal types');
// ----------------------------------------------------------------------------
// String patterns as types:
type Tag = `@${string}`;
type Size = 'sm' | 'lg';
type Variant = 'primary' | 'danger';
type ButtonClass = `btn-${Size}-${Variant}`; // 4 combinations: 'btn-sm-primary' | ...

const tags: Tag[] = ['@smoke', '@regression'];
const buttonClass: ButtonClass = 'btn-lg-danger';

// Error: Type '"smoke"' is not assignable to type '`@${string}`'.
// @ts-expect-error -- tags must start with @
const badTag: Tag = 'smoke';
void badTag;
console.log(tags.join(' '), buttonClass); // PREDICT #14

// ----------------------------------------------------------------------------
section('9. Modern generic tools: `const` type parameters and NoInfer');
// ----------------------------------------------------------------------------
// `const T` (TypeScript 5.0) infers the NARROWEST type, as if the caller had
// written `as const`. Without `const`, ['chromium', 'firefox'] is string[].
function defineProjects<const T extends readonly string[]>(names: T): T {
  return names;
}
const projectNames = defineProjects(['chromium', 'firefox']); // readonly ['chromium', 'firefox']
type ProjectName = (typeof projectNames)[number]; //            'chromium' | 'firefox'
const picked: ProjectName = 'firefox';
console.log(projectNames, picked); // PREDICT #15

// `NoInfer<T>` (TypeScript 5.4) tells TypeScript: "don't use THIS argument to
// infer T". T then comes only from `allowed`, so the fallback must be one of
// the allowed values.
function pickOption<T extends string>(
  allowed: readonly T[],
  value: string | undefined,
  fallback: NoInfer<T>,
): T {
  return allowed.find((item) => item === value) ?? fallback;
}
const browser = pickOption(['chromium', 'firefox'], process.env.LESSON_BROWSER, 'chromium');
console.log(browser); // PREDICT #16

const neverCalledEither = (): void => {
  // Error: Argument of type '"chrome"' is not assignable to parameter of type '"chromium" | "firefox"'.
  // Without NoInfer, T would silently widen to 'chromium' | 'firefox' | 'chrome'.
  // @ts-expect-error -- the fallback must be an allowed value
  pickOption(['chromium', 'firefox'], undefined, 'chrome');
};

// ----------------------------------------------------------------------------
section('10. Best practices for generics');
// ----------------------------------------------------------------------------
// - A type parameter must CONNECT things (input to output, or two inputs).
//   Used only once? You don't need it:
//     AVOID   function logValue<T>(value: T): void
//     PREFER  function logValue(value: unknown): void
// - Naming: `T`, `K`, `V` are fine for short, conventional cases like
//   getProperty<T, K extends keyof T>. Use descriptive names (`TItem`,
//   `TResponse`) when the meaning isn't obvious from context.
// - Default to `unknown`, never `any`:  interface Message<TBody = unknown>.
// - Don't write a mapped type when a built-in utility type already does it.
// - Derive types from values (typeof, keyof, `as const`) to avoid duplicates.
// - Don't pass type arguments that would be inferred anyway.
console.log('Done. Now open exercises.ts and practice from memory!');
void neverCalled;
void neverCalledEither;

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - Generics keep type information flowing: first<T>(items: T[]): T.
 *    - `extends` constrains a generic. `K extends keyof T` + `T[K]` = typed
 *      property access.
 *    - typeof / keyof / T['prop'] derive types from values and other types.
 *    - Partial, Required, Readonly, Pick, Omit, Record, Extract, Exclude,
 *      NonNullable, ReturnType, Parameters, Awaited: learn them, use them.
 *    - Mapped types loop over keys. Template literal types describe patterns.
 *    - `const T` infers literals; NoInfer<T> stops one argument from
 *      widening T.
 *
 *  In Playwright:
 *    test.extend<{ loginPage: LoginPage }>({ ... })    // generic fixtures (Lesson 20)
 *    const y = await page.evaluate(() => window.scrollY); // Promise<number>, inferred
 *    type TestUser = Omit<User, 'id'>;                 // test data shapes
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1   PLAYWRIGHT 10 playwright
 *   #2   login 1
 *   #3   120
 *   #4   abc [ 1, 2, 3 ]  — on a tie (or when `a` is longer) `a` wins.
 *   #5   3
 *   #6   [ 'timeout=30000', 'headless=true' ] 5000
 *   #7   [ 'ada', 'linus' ]           (first loop run: ok is true)
 *        503 Service Unavailable      (second run: ok is false)
 *   #8   uses the default T = string 2
 *   #9   { id: 1, name: 'Ada Lovelace' } Ada  — updateUser returned a NEW object.
 *   #10  4 true Ada Lovelace
 *   #11  2 Grace Linus
 *   #12  [ 'failed', 'timedOut' ] skipped
 *   #13  true Countess Ada 30000
 *   #14  @smoke @regression btn-lg-danger
 *   #15  [ 'chromium', 'firefox' ] firefox
 *   #16  chromium  (or firefox, if you set LESSON_BROWSER=firefox)
 * ============================================================================
 */
