/**
 * ============================================================================
 *  LESSON 20 — TypeScript for Playwright
 * ============================================================================
 *  Run:        node course/02-typescript/20-typescript-for-playwright/lesson.ts
 *  Practice:   node course/02-typescript/20-typescript-for-playwright/exercises.ts
 *  Type-check: npm run course:typecheck   (from the repository root)
 *
 *  After this lesson you can:
 *    1. Explain structural typing, and use it to fake a page without a browser.
 *    2. Import Playwright's types with `import type` (zero runtime cost).
 *    3. Write a typed page object that EXPOSES LOCATORS, so tests can use
 *       web-first assertions.
 *    4. Prefer composition (component objects) over deep BasePage trees.
 *    5. Type test data with `as const` + `satisfies`, and build UNIQUE data.
 *    6. Type real fixtures: test.extend<TestFixtures, WorkerFixtures>,
 *       option fixtures and mergeTests.
 *    7. Treat API response bodies as `unknown` and validate them.
 *    8. Know what the type-checker does NOT catch: un-awaited promises.
 *
 *  How to study this file:
 *    - Every example has a numbered PREDICT comment. Write down your guess,
 *      run the file, then check the ANSWER KEY at the bottom.
 *    - Everything here runs WITHOUT a browser. The page is a typed fake.
 *      Code that needs real Playwright objects is type-checked but never
 *      executed (it lives in functions we never call).
 *    - `// @ts-expect-error` lines are type errors on purpose. The comment
 *      above each one quotes the message the compiler reports.
 * ============================================================================
 */
// Type-only imports from the real Playwright package. They're erased when
// Node runs this file, so no browser code is loaded, but the editor and `tsc`
// check our code against the REAL Playwright API.
import type { APIRequestContext, Locator, Page, PlaywrightTestConfig } from '@playwright/test';
import { setTimeout as sleep } from 'node:timers/promises';

// `typeof import('...')` reads the TYPE of a runtime export, also erased.
type PlaywrightTest = typeof import('@playwright/test').test;
type PlaywrightExpect = typeof import('@playwright/test').expect;
type MergeTests = typeof import('@playwright/test').mergeTests;

const section = (title: string): void => console.log(`\n--- ${title} ---`);

// ----------------------------------------------------------------------------
section('1. Structural typing: shape matters, not names');
// ----------------------------------------------------------------------------
// TypeScript compares SHAPES. Anything with the right properties fits a type,
// even if it never mentions that type. ("If it walks like a duck...")
interface Clickable {
  click(): Promise<void>;
}

class FakeButton {
  clicks = 0;
  async click(): Promise<void> {
    this.clicks += 1;
  }
}

const fakeButton = new FakeButton();
const clickable: Clickable = fakeButton; // OK: FakeButton has `click()`
await clickable.click(); // top-level await: fine in ES modules
await clickable.click();
console.log(fakeButton.clicks); // PREDICT #1

// This is why you can replace a real Playwright Page with a small fake in
// unit tests of your helpers: only the shape has to match.

// ----------------------------------------------------------------------------
section('2. A real page object, typed with Playwright types');
// ----------------------------------------------------------------------------
// This class is type-checked against the real `Page` and `Locator` types.
// We never create one here (that needs a browser), but your editor checks it.
interface Credentials {
  readonly email: string;
  readonly password: string;
}

class RealLoginPage {
  // Public readonly fields: the style of the Playwright docs. Tests may READ
  // them (e.g. `expect(loginPage.errorAlert)`) but can't reassign them.
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Log in' });
    this.errorAlert = page.getByRole('alert');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  // Page objects perform ACTIONS. Assertions stay in the test (section 3).
  async login({ email, password }: Credentials): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
console.log(typeof RealLoginPage); // PREDICT #2

// AVOID constructor parameter properties, seen in many older tutorials:
//   constructor(private readonly page: Page) {}
// They generate hidden runtime code. Node's type stripping refuses to run
// them, and our tsconfig (erasableSyntaxOnly) reports them as errors.
// PREFER explicit fields assigned in the constructor, like above.
//
// `readonly page` (public) or `#page` (private)? Both are fine. This course
// defaults to PUBLIC readonly `page` and locators, because tests need them
// for assertions like `await expect(loginPage.page).toHaveURL(...)`. Use
// `#private` for internal state and helpers that tests must not touch.

// ----------------------------------------------------------------------------
section('3. Assertions belong in the test: expose locators');
// ----------------------------------------------------------------------------
// AVOID: a page object that returns text for the test to compare:
//   async errorMessage(): Promise<string> {
//     return (await this.errorAlert.textContent()) ?? '';
//   }
//   expect(await loginPage.errorMessage()).toBe('Wrong password');
// It reads the text ONCE. If the alert appears 50ms later, the test fails,
// and you get a flaky suite.
//
// PREFER: expose the Locator and use a WEB-FIRST assertion. It retries until
// the text matches or the timeout expires:
//   await expect(loginPage.errorAlert).toHaveText('Wrong password');
//
// Keep string-returning methods for DATA you need later (an order number to
// look up, a generated id), not for checking what the user sees.
// Section 9 shows a type-checked test that does exactly this.
console.log('assert with expect(locator), not with text you read once'); // PREDICT #3

// ----------------------------------------------------------------------------
section('4. A narrow interface: run page objects without a browser');
// ----------------------------------------------------------------------------
// We describe ONLY the parts of Page/Locator our page objects use.
type FakeRole = 'button' | 'alert' | 'banner' | 'link';

interface LocatorLike {
  fill(value: string): Promise<void>;
  click(): Promise<void>;
  textContent(): Promise<string | null>;
  getByRole(role: FakeRole, options?: { name?: string }): LocatorLike;
}

interface PageLike {
  goto(url: string): Promise<unknown>;
  getByLabel(text: string): LocatorLike;
  getByRole(role: FakeRole, options?: { name?: string }): LocatorLike;
}

// Compile-time proof that the REAL Playwright Page fits our narrow interface.
// If it didn't, this line would be a type error.
const realPageFits = (page: Page): PageLike => page;
void realPageFits;

const describeRole = (role: FakeRole, options: { name?: string }): string =>
  options.name ? `${role}[name=${options.name}]` : role;

// A fake page that records every action instead of driving a browser.
// Like a real browser, every action TAKES TIME (sleep), so a missing `await`
// shows up as missing or out-of-order actions.
class FakePage implements PageLike {
  readonly actions: string[] = [];
  readonly texts = new Map<string, string>(); // selector -> text it shows

  async goto(url: string): Promise<void> {
    await sleep(1);
    this.actions.push(`goto ${url}`);
  }

  getByLabel(text: string): LocatorLike {
    return this.#locator(`label=${text}`);
  }

  getByRole(role: FakeRole, options: { name?: string } = {}): LocatorLike {
    return this.#locator(describeRole(role, options));
  }

  #locator(selector: string): LocatorLike {
    return {
      fill: async (value) => {
        await sleep(1);
        this.actions.push(`fill ${selector} "${value}"`);
      },
      click: async () => {
        await sleep(1);
        this.actions.push(`click ${selector}`);
      },
      textContent: async () => this.texts.get(selector) ?? null,
      getByRole: (role, options = {}) =>
        this.#locator(`${selector} >> ${describeRole(role, options)}`),
    };
  }
}
console.log(new FakePage().actions); // PREDICT #4

// ----------------------------------------------------------------------------
section('5. The same page object, running on the fake');
// ----------------------------------------------------------------------------
class LoginPage {
  readonly page: PageLike;
  readonly emailInput: LocatorLike;
  readonly passwordInput: LocatorLike;
  readonly submitButton: LocatorLike;
  readonly errorAlert: LocatorLike;
  // `#loginAttempts` is truly private at RUNTIME (a JavaScript feature).
  // TypeScript's `private` keyword is only checked at compile time.
  #loginAttempts = 0;

  constructor(page: PageLike) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Log in' });
    this.errorAlert = page.getByRole('alert');
  }

  get loginAttempts(): number {
    return this.#loginAttempts;
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  // Taking an object makes calls readable: login(USERS.standard)
  async login({ email, password }: Credentials): Promise<void> {
    this.#loginAttempts += 1;
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

// `#loginAttempts` doesn't show up when you list the object's keys:
console.log(Object.keys(new LoginPage(new FakePage()))); // PREDICT #5

// In your real project, type the constructor with `Page` (section 2). The
// narrow PageLike here only exists so this lesson runs without a browser.

// ----------------------------------------------------------------------------
section('6. Components: composition over deep inheritance');
// ----------------------------------------------------------------------------
// AVOID deep trees like BasePage -> AuthenticatedPage -> ShopPage -> CartPage.
// Every change to a base class ripples through all pages.
// PREFER small COMPONENT objects that take a root Locator, and compose them:
class HeaderComponent {
  readonly root: LocatorLike;
  readonly cartLink: LocatorLike;
  readonly logoutButton: LocatorLike;

  constructor(root: LocatorLike) {
    this.root = root;
    this.cartLink = root.getByRole('link', { name: 'Cart' });
    this.logoutButton = root.getByRole('button', { name: 'Log out' });
  }

  async logOut(): Promise<void> {
    await this.logoutButton.click();
  }
}

// One SHALLOW base class for shared navigation is fine. With
// `noImplicitOverride` (our tsconfig), redefining a base member requires the
// `override` keyword, so renaming the base member can't silently break it.
class BasePage {
  readonly page: PageLike;
  readonly path: string = '/';

  constructor(page: PageLike) {
    this.page = page;
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }
}

class InventoryPage extends BasePage {
  override readonly path = '/inventory';
  readonly header: HeaderComponent; // composed, not inherited

  constructor(page: PageLike) {
    super(page);
    this.header = new HeaderComponent(page.getByRole('banner'));
  }
}

class ForgotOverridePage extends BasePage {
  // Error: This member must have an 'override' modifier because it overrides a member in the base class 'BasePage'.
  // @ts-expect-error -- `override` is required by noImplicitOverride
  readonly path = '/forgot';
}
void ForgotOverridePage;

const shopPage = new FakePage();
const inventoryPage = new InventoryPage(shopPage);
await inventoryPage.goto();
await inventoryPage.header.logOut();
console.log(shopPage.actions); // PREDICT #6

// ----------------------------------------------------------------------------
section('7. Test data: `as const` + `satisfies`');
// ----------------------------------------------------------------------------
// `satisfies` checks every entry has the Credentials shape. `as const` keeps
// the exact keys and makes everything readonly.
// SECURITY: only PUBLIC demo credentials belong in source code. Real
// passwords and tokens come from environment variables (section 11, and
// Lesson 22 for .env files).
const USERS = {
  standard: { email: 'standard.user@example.com', password: 'correct-horse' },
  locked: { email: 'locked.user@example.com', password: 'correct-horse' },
} as const satisfies Record<string, Credentials>;

type UserKey = keyof typeof USERS; // 'standard' | 'locked'

const page = new FakePage();
const loginPage = new LoginPage(page);
await loginPage.goto();
await loginPage.login(USERS.standard);
console.log(page.actions); // PREDICT #7
console.log(loginPage.loginAttempts); // PREDICT #8

const userKey: UserKey = 'locked';
// Error: Property 'admin' does not exist on type '{ readonly standard: { readonly email:
// "standard.user@example.com"; readonly password: "correct-horse"; }; readonly locked:
// { readonly email: "locked.user@example.com"; readonly password: "correct-horse"; }; }'.
// @ts-expect-error -- no such test user
console.log(USERS.admin); // PREDICT #9
console.log(USERS[userKey].email); // PREDICT #10

// ----------------------------------------------------------------------------
section('8. Factories with UNIQUE data');
// ----------------------------------------------------------------------------
// A factory builds valid test data with sensible defaults. Each test only
// states what MATTERS for it.
// The repo runs tests in parallel (`fullyParallel: true`). Two tests that
// create the same user email at the same time collide on a real server. So
// defaults must be UNIQUE: crypto.randomUUID() (built into Node and browsers).
interface TestUser {
  name: string;
  email: string;
  role: 'viewer' | 'admin';
}

function buildUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    name: 'Test User',
    email: `test.user.${crypto.randomUUID()}@example.com`,
    role: 'viewer',
    ...overrides,
  };
}

const userA = buildUser();
const userB = buildUser({ role: 'admin' });
console.log(userA.role, userB.role, userA.email !== userB.email); // PREDICT #11
console.log(/^test\.user\.[0-9a-f-]{36}@example\.com$/.test(userA.email)); // PREDICT #12
console.log(buildUser({ email: 'ada@example.com' }).email); // PREDICT #13

// Need data that is unique AND readable in reports? Combine the worker index
// with a counter or UUID: `user.w${testInfo.workerIndex}.${id}@example.com`.

// ----------------------------------------------------------------------------
section('9. Fixtures: setup -> use -> teardown, fully typed');
// ----------------------------------------------------------------------------
// The SHAPE of a Playwright fixture, in miniature and runnable:
type Fixture<T> = (use: (value: T) => Promise<void>) => Promise<void>;

const loginPageFixture: Fixture<LoginPage> = async (use) => {
  const fixturePage = new FakePage(); //  setup
  await use(new LoginPage(fixturePage)); // the "test" runs inside `use`
  console.log(`teardown: ${fixturePage.actions.length} actions recorded`); // PREDICT #14 (teardown)
};

await loginPageFixture(async (fixtureLoginPage) => {
  await fixtureLoginPage.login(USERS.locked);
  console.log('test body ran'); // PREDICT #15 (and: which prints first, #14 or #15?)
});

// The REAL thing. These functions are type-checked against @playwright/test
// but never called: in your project they live in `fixtures.ts` and specs.
interface PageFixtures {
  loginPage: RealLoginPage;
}
interface DataOptions {
  defaultRole: TestUser['role']; // an OPTION fixture: set per project in the config
}
interface DataFixtures {
  testUser: TestUser;
}
interface ApiWorkerFixtures {
  apiToken: string; // WORKER fixture: created once per worker process
}

// fixtures.ts
//   import { test as base, mergeTests } from '@playwright/test';
//   export const test = createFixtures(base, mergeTests);
//   export { expect } from '@playwright/test';
function createFixtures(base: PlaywrightTest, merge: MergeTests) {
  const pagesTest = base.extend<PageFixtures>({
    // Depends on Playwright's built-in `page` fixture:
    loginPage: async ({ page }, use) => {
      const fixtureLoginPage = new RealLoginPage(page);
      await fixtureLoginPage.goto();
      await use(fixtureLoginPage);
    },
  });

  const dataTest = base.extend<DataOptions & DataFixtures, ApiWorkerFixtures>({
    defaultRole: ['viewer', { option: true }],
    // Depends on another fixture (defaultRole) and on testInfo:
    testUser: async ({ defaultRole }, use, testInfo) => {
      await use(
        buildUser({
          role: defaultRole,
          email: `user.w${testInfo.workerIndex}.${crypto.randomUUID()}@example.com`,
        }),
      );
    },
    apiToken: [
      async ({}, use) => {
        await use(requireEnv('LESSON_API_TOKEN'));
      },
      { scope: 'worker' },
    ],
  });

  // mergeTests combines independent fixture sets into ONE `test`.
  return merge(pagesTest, dataTest);
}

// login.spec.ts
//   import { test, expect } from './fixtures';
function exampleSpec(test: ReturnType<typeof createFixtures>, expect: PlaywrightExpect): void {
  test('wrong password shows an error', async ({ loginPage, testUser }) => {
    await loginPage.login({ email: testUser.email, password: 'wrong-password' });
    await expect(loginPage.errorAlert).toHaveText('Wrong password'); // web-first: retries
    await expect(loginPage.page).toHaveURL(/\/login$/);
  });
}
void exampleSpec;

// playwright.config.ts: option fixtures are type-checked per project.
const configExample = {
  projects: [
    { name: 'viewers', use: { defaultRole: 'viewer' } },
    { name: 'admins', use: { defaultRole: 'admin' } },
  ],
} satisfies PlaywrightTestConfig<DataOptions>;
console.log(configExample.projects.map((project) => project.name)); // PREDICT #16

// ----------------------------------------------------------------------------
section('10. API responses are `unknown` until you check them');
// ----------------------------------------------------------------------------
// Playwright types `response.json()` as Promise<any>. `any` leaks silently:
//   const body = await response.json();
//   const id: number = body.user.idd;   // typo, wrong type: compiles anyway!
// PREFER: store it as `unknown` and validate it at the boundary.
interface CreatedUser {
  readonly id: string;
  readonly email: string;
}

function isCreatedUser(value: unknown): value is CreatedUser {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'email' in value &&
    typeof value.email === 'string'
  );
}

function assertCreatedUser(value: unknown): asserts value is CreatedUser {
  if (!isCreatedUser(value)) {
    throw new TypeError(`Unexpected response body: ${JSON.stringify(value)}`);
  }
}

// Type-checked against the real APIRequestContext, never called here:
async function createUserViaApi(request: APIRequestContext, user: TestUser): Promise<CreatedUser> {
  const response = await request.post('/api/users', { data: user });
  if (!response.ok()) {
    throw new Error(`POST /api/users failed with status ${response.status()}`);
  }
  const body: unknown = await response.json();
  assertCreatedUser(body);
  return body; // narrowed to CreatedUser
}
void createUserViaApi;

// The same validation on a JSON string, so it runs here:
const goodBody: unknown = JSON.parse('{"id":"u_42","email":"ada@example.com"}');
assertCreatedUser(goodBody);
console.log(goodBody.email); // PREDICT #17
try {
  assertCreatedUser(JSON.parse('{"id":42}'));
} catch (error) {
  console.log(error instanceof Error ? error.message : error); // PREDICT #18
}

// In production frameworks a schema library (for example zod) does this:
// ONE schema gives you both the runtime check and the TypeScript type.
//   const CreatedUser = z.object({ id: z.string(), email: z.string() });
//   const user = CreatedUser.parse(await response.json());

// ----------------------------------------------------------------------------
section('11. Async return types, and what tsc does NOT catch');
// ----------------------------------------------------------------------------
// An async function ALWAYS returns a Promise. Forgetting `await` is the #1
// bug in Playwright tests. TypeScript catches it only when you USE the value
// with the wrong type:
// Error: Type 'Promise<string | null>' is not assignable to type 'string'.
// (TypeScript reports the closest member of the target union.)
// @ts-expect-error -- missing await
const notAwaited: string | null = loginPage.errorAlert.textContent();
console.log(typeof notAwaited); // PREDICT #19

// The COMMON case compiles with no error at all. A call whose result you
// ignore is a "floating promise", and tsc is silent about it:
const floatingPage = new FakePage();
const floatingLoginPage = new LoginPage(floatingPage);
floatingLoginPage.login(USERS.standard); // <- missing await: compiles fine!
console.log(floatingPage.actions.length); // PREDICT #20

// In a real test the same mistake looks like this, and also compiles:
//   loginPage.login(user);                            // floating promise
//   expect(loginPage.errorAlert).toBeVisible();       // floating assertion!
// Only LINTERS catch these:
//   - @typescript-eslint/no-floating-promises (type-aware lint rule)
//   - eslint-plugin-playwright: missing-playwright-await (for expect/APIs)
// The repo's ESLint setup (`npm run lint`) enables both for tests/.
// BEST PRACTICE: write the return type of async page-object methods
// (Promise<void>, Promise<string>...) AND run the linter.

// ----------------------------------------------------------------------------
section('12. Environment variables are `string | undefined`');
// ----------------------------------------------------------------------------
// AVOID:  const baseURL = process.env.LESSON_BASE_URL!;   // `!` hides a crash
// PREFER a default, or fail fast with a clear message:
const baseURL = process.env.LESSON_BASE_URL ?? 'http://localhost:4200';
console.log(baseURL); // PREDICT #21

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value; // narrowed to string
}
try {
  requireEnv('LESSON_API_TOKEN');
} catch (error) {
  console.log(error instanceof Error ? error.message : error); // PREDICT #22
}

// ----------------------------------------------------------------------------
section('13. Outdated habits you can drop');
// ----------------------------------------------------------------------------
// - `page.fill('#email', ...)` / `page.click('#submit')`: use locators
//   (getByRole, getByLabel, getByTestId) stored on the page object.
// - Page objects that return text for `expect(value)`: expose the Locator
//   and use web-first assertions.
// - `constructor(private page: Page)` parameter properties: explicit fields.
// - Deep BasePage inheritance: components + composition.
// - `enum Role { Admin }` for test users: `as const` objects + keyof.
// - `page: any`, `as any`, `response.json()` used as-is: real types, unknown.
// - Fixed test data (`test.user@example.com`) in parallel suites: unique data.
// - `process.env.X!`: `??` defaults or a requireEnv helper.
console.log('Done. Now open exercises.ts and practice from memory!');

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - Structural typing: shapes, not names. A fake with the right shape fits.
 *    - `import type { Page, Locator } from '@playwright/test'` costs nothing
 *      at runtime.
 *    - Page objects: readonly locator fields, actions as typed async methods,
 *      assertions in the test with `await expect(locator)...`.
 *    - Components over deep inheritance. `override` when you do extend.
 *    - Test data: `as const satisfies Record<string, Credentials>`; factories
 *      with Partial<T> overrides and UNIQUE defaults.
 *    - Fixtures: base.extend<TestFixtures, WorkerFixtures>, options with
 *      `{ option: true }`, mergeTests, `import { test, expect } from './fixtures'`.
 *    - API bodies: `unknown` + type guard (or a schema library).
 *    - tsc does not catch floating promises. The linter does.
 *
 *  In Playwright:
 *    test('login', async ({ loginPage }) => {
 *      await loginPage.login(USERS.standard);
 *      await expect(loginPage.page).toHaveURL(/inventory/);
 *    });
 *
 *  Next: Lesson 21 (testing fundamentals), Lesson 22 (Node files, HTTP and
 *  config) and the Lesson 23 capstone, where you build this for real in tests/.
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1   2
 *   #2   function  — a class is a function at runtime.
 *   #3   assert with expect(locator), not with text you read once
 *   #4   []  — nothing has happened yet.
 *   #5   [ 'page', 'emailInput', 'passwordInput', 'submitButton', 'errorAlert' ]
 *        — public fields in declaration order; `#loginAttempts` is hidden.
 *   #6   [ 'goto /inventory', 'click banner >> button[name=Log out]' ]
 *        — `override readonly path` changed where goto() navigates.
 *   #7   [
 *          'goto /login',
 *          'fill label=Email "standard.user@example.com"',
 *          'fill label=Password "correct-horse"',
 *          'click button[name=Log in]'
 *        ]
 *   #8   1
 *   #9   undefined  — the type-checker reports it; at runtime it's just missing.
 *   #10  locked.user@example.com
 *   #11  viewer admin true
 *   #12  true
 *   #13  ada@example.com  — an explicit override beats the unique default.
 *   #14  teardown: 3 actions recorded
 *   #15  test body ran  — printed BEFORE #14: the test body runs inside
 *        `use()`, and the teardown code after `use()` runs when it's done.
 *   #16  [ 'viewers', 'admins' ]
 *   #17  ada@example.com
 *   #18  Unexpected response body: {"id":42}
 *   #19  object  — typed as string | null, but it's really a Promise!
 *   #20  0  — the login hasn't happened yet; a test would move on without it.
 *   #21  http://localhost:4200  (unless you set LESSON_BASE_URL)
 *   #22  Missing environment variable: LESSON_API_TOKEN
 * ============================================================================
 */
