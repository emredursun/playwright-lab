/**
 * ============================================================================
 *  EXERCISES 20 — TypeScript for Playwright
 * ============================================================================
 *  Run:  node course/typescript/20-typescript-for-playwright/exercises.ts
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
import { setTimeout as sleep } from 'node:timers/promises';

// ------------------------- Given: a typed fake page --------------------------
// Like a real browser, actions take time: fill() takes 2ms, click() 1ms.
// A missing `await` (or running steps in parallel) changes what gets recorded.
type Role = 'button' | 'alert' | 'searchbox' | 'status';

interface LocatorLike {
  fill(value: string): Promise<void>;
  click(): Promise<void>;
  textContent(): Promise<string | null>;
}

interface PageLike {
  goto(url: string): Promise<unknown>;
  getByLabel(text: string): LocatorLike;
  getByRole(role: Role, options?: { name?: string }): LocatorLike;
}

class FakePage implements PageLike {
  readonly actions: string[] = [];
  readonly #texts: Readonly<Record<string, string>>;

  // `texts` maps a selector (like 'status') to the text it should return.
  constructor(texts: Readonly<Record<string, string>> = {}) {
    this.#texts = texts;
  }

  async goto(url: string): Promise<void> {
    await sleep(1);
    this.actions.push(`goto ${url}`);
  }

  getByLabel(text: string): LocatorLike {
    return this.#locator(`label=${text}`);
  }

  getByRole(role: Role, options: { name?: string } = {}): LocatorLike {
    return this.#locator(options.name ? `${role}[name=${options.name}]` : role);
  }

  #locator(selector: string): LocatorLike {
    return {
      fill: async (value) => {
        await sleep(2);
        this.actions.push(`fill ${selector} "${value}"`);
      },
      click: async () => {
        await sleep(1);
        this.actions.push(`click ${selector}`);
      },
      textContent: async () => this.#texts[selector] ?? null,
    };
  }
}

interface Credentials {
  readonly email: string;
  readonly password: string;
}

const USERS = {
  standard: { email: 'standard.user@example.com', password: 'correct-horse' },
  locked: { email: 'locked.user@example.com', password: 'correct-horse' },
} as const satisfies Record<string, Credentials>;

type UserKey = keyof typeof USERS;

// ----------------------------------------------------------------------------
// Exercise 1 — A type guard for test-user keys
// Return true when `value` is a key of USERS, e.g. coming from an env var.
// isUserKey('standard') -> true    isUserKey('admin') -> false
// Careful: isUserKey('toString') must be false. Every object inherits it!
// ----------------------------------------------------------------------------
function isUserKey(value: string): value is UserKey {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 2 — Finish the page object
// search(term):   fill the search box with `term`, THEN click the Search
//                 button. Each step must finish before the next starts.
// resultCount():  DATA extraction: the number at the start of the status text
//                 ('3 results' -> 3, '1 result' -> 1), or 0 when there is no
//                 number (null, whitespace, 'No results').
// Note: for checking what the user SEES, a real test would not use this
// method. It would assert on the exposed locator:
//   await expect(searchPage.status).toHaveText('3 results');
// ----------------------------------------------------------------------------
class SearchPage {
  readonly searchBox: LocatorLike;
  readonly searchButton: LocatorLike;
  readonly status: LocatorLike;

  constructor(page: PageLike) {
    this.searchBox = page.getByRole('searchbox');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.status = page.getByRole('status');
  }

  async search(term: string): Promise<void> {
    throw new Error('TODO');
  }

  async resultCount(): Promise<number> {
    throw new Error('TODO');
  }
}

// ----------------------------------------------------------------------------
// Exercise 3 — Validate an API response body
// `body` comes from `await response.json()`, so treat it as unknown.
// Return it as a CreatedUser when it has a string `id` and a string `email`.
// Otherwise throw a TypeError whose message starts with
// 'Unexpected response body'.
// ----------------------------------------------------------------------------
interface CreatedUser {
  readonly id: string;
  readonly email: string;
}

function parseCreatedUser(body: unknown): CreatedUser {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 4 — A test-data factory with unique defaults
// Return a valid TestUser. Defaults:
//   name 'Test User', role 'viewer',
//   email `test.user.<uuid>@example.com`  (unique on every call: tests run in
//   parallel). Any field in `overrides` replaces the default.
// ----------------------------------------------------------------------------
interface TestUser {
  name: string;
  email: string;
  role: 'viewer' | 'admin';
}

function buildUser(overrides: Partial<TestUser> = {}): TestUser {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 5 (bonus) — A typed retry helper
// Call `action` up to `attempts` times. Resolve with the first success.
// If every attempt fails, reject with the LAST error.
// If attempts is not a positive integer, reject with a RangeError.
// ----------------------------------------------------------------------------
async function retry<T>(action: () => Promise<T>, attempts: number): Promise<T> {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.ts)
//   Q1. Why can FakePage be used where a page object expects PageLike?
//       Would it still work without `implements PageLike`?
//   Q2. Why avoid `constructor(private readonly page: Page) {}` here?
//   Q3. A page object has `async errorText(): Promise<string>`, and the test
//       does `expect(await loginPage.errorText()).toBe('Wrong password')`.
//       Why is this flaky, and how would you redesign it?
//   Q4. What does `as const satisfies Record<string, Credentials>` give you
//       that `: Record<string, Credentials>` does not?
//   Q5. This compiles without errors:
//         loginPage.login(user);
//         await expect(page).toHaveURL('/inventory');
//       What's wrong, why doesn't tsc catch it, and which tool does?
//
// Review (spaced repetition: earlier lessons)
//   R1. (Lesson 19) Why does buildUser take `Partial<TestUser>` rather than
//       a full TestUser?
//   R2. (Lesson 14) You store a login token in a module-level variable so
//       all tests can share it. Does that work across Playwright workers?
//   R3. (Lesson 12) When is it OK to catch an error in test code, and what
//       must you do with errors you can't handle?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
test('1. isUserKey: only real keys of USERS', () => {
  assert.equal(isUserKey('standard'), true);
  assert.equal(isUserKey('locked'), true);
  assert.equal(isUserKey('admin'), false);
  assert.equal(isUserKey('toString'), false);
});

test('2. SearchPage: awaits each step and extracts the result count', async () => {
  const page = new FakePage({ status: '  3 results  ' });
  const searchPage = new SearchPage(page);
  await searchPage.search('playwright');
  assert.deepEqual(page.actions, ['fill searchbox "playwright"', 'click button[name=Search]']);
  assert.equal(await searchPage.resultCount(), 3);
  assert.equal(await new SearchPage(new FakePage({ status: '1 result' })).resultCount(), 1);
  assert.equal(await new SearchPage(new FakePage()).resultCount(), 0);
  assert.equal(await new SearchPage(new FakePage({ status: '   ' })).resultCount(), 0);
  assert.equal(await new SearchPage(new FakePage({ status: 'No results' })).resultCount(), 0);
});

test('3. parseCreatedUser: accepts valid bodies, rejects everything else', () => {
  const body: unknown = JSON.parse('{"id":"u_1","email":"ada@example.com"}');
  assert.deepEqual(parseCreatedUser(body), { id: 'u_1', email: 'ada@example.com' });
  for (const bad of [{ id: 'u_1' }, { id: 1, email: 'ada@example.com' }, null, 'u_1', []]) {
    assert.throws(() => parseCreatedUser(bad), {
      name: 'TypeError',
      message: /^Unexpected response body/,
    });
  }
});

test('4. buildUser: unique defaults plus overrides', () => {
  const first = buildUser();
  const second = buildUser();
  assert.equal(first.name, 'Test User');
  assert.equal(first.role, 'viewer');
  assert.match(first.email, /^test\.user\.[0-9a-f-]{36}@example\.com$/);
  assert.notEqual(first.email, second.email);
  assert.deepEqual(buildUser({ role: 'admin', name: 'Ada', email: 'ada@example.com' }), {
    name: 'Ada',
    email: 'ada@example.com',
    role: 'admin',
  });
});

test('5. retry (bonus): retries until success, then gives up', async () => {
  let calls = 0;
  const value = await retry(async () => {
    calls += 1;
    if (calls < 3) throw new Error(`fail ${calls}`);
    return 'ok';
  }, 3);
  assert.equal(value, 'ok');
  assert.equal(calls, 3);

  let failingCalls = 0;
  await assert.rejects(
    retry(async () => {
      failingCalls += 1;
      throw new Error(`fail ${failingCalls}`);
    }, 2),
    { message: 'fail 2' },
  );
  assert.equal(failingCalls, 2);

  await assert.rejects(
    retry(async () => 'never runs', 0),
    RangeError,
  );
});
