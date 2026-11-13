/**
 * ============================================================================
 *  SOLUTIONS 20 — TypeScript for Playwright
 * ============================================================================
 *  Run:  node course/02-typescript/20-typescript-for-playwright/solutions.ts
 *
 *  Compare these with YOUR solutions. If yours is different but the tests pass
 *  AND `npm run course:typecheck` reports no errors, it may be just as good.
 *  Read the WHY comments to see the trade-offs.
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

// Exercise 1
// WHY: `value in USERS` would also be true for inherited keys like
// 'toString'. Object.hasOwn checks only the object's OWN keys. The
// `value is UserKey` return type lets callers then write USERS[value] safely.
function isUserKey(value: string): value is UserKey {
  return Object.hasOwn(USERS, value);
}

// Exercise 2
// WHY: each step is awaited, so the click starts only after the fill has
// finished, like a user would do it. Without `await` the test checks
// `actions` before anything happened. With Promise.all both steps run at
// once and the (faster) click lands first: also wrong.
// resultCount() is DATA extraction: textContent() may return null, `?? ''`
// handles that, and the regex reads a leading number. `match?.[1] ?? 0`
// covers "no match" without `!` (noUncheckedIndexedAccess makes [1]
// `string | undefined`).
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
    await this.searchBox.fill(term);
    await this.searchButton.click();
  }

  async resultCount(): Promise<number> {
    const text = (await this.status.textContent()) ?? '';
    const match = /^\s*(\d+)/.exec(text);
    return Number(match?.[1] ?? 0);
  }
}

// Exercise 3
// WHY: `unknown` forces a check before use. Each condition narrows the type
// one step (object -> has `id` -> `id` is a string ...), so the final
// `return body` is a CreatedUser with no cast. An array is an object too,
// but it has no `id`, so it is rejected. In a real framework a schema
// library (e.g. zod) replaces this hand-written guard.
interface CreatedUser {
  readonly id: string;
  readonly email: string;
}

function parseCreatedUser(body: unknown): CreatedUser {
  if (
    typeof body === 'object' &&
    body !== null &&
    'id' in body &&
    typeof body.id === 'string' &&
    'email' in body &&
    typeof body.email === 'string'
  ) {
    return { id: body.id, email: body.email };
  }
  throw new TypeError(`Unexpected response body: ${JSON.stringify(body)}`);
}

// Exercise 4
// WHY: defaults first, overrides spread last so they win. Partial<TestUser>
// lets each test state only what matters for it. crypto.randomUUID() makes
// every default email unique, so parallel tests never fight over the same
// user. With exactOptionalPropertyTypes, `{ role: undefined }` is rejected,
// so a default can't be erased by accident.
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

// Exercise 5
// WHY: `return await` inside `try` is REQUIRED. A bare `return action()`
// would hand the promise out before it settles, so the catch would never
// see the rejection. The last error is kept as `unknown` and rethrown as-is.
// NOTE: in Playwright tests you rarely need this. Locators auto-wait,
// `expect(...).toPass()` and `expect.poll()` retry assertions, and `retries`
// in the config retries whole tests. Use a helper like this for tooling and
// API setup, not to paper over a flaky UI step.
async function retry<T>(action: () => Promise<T>, attempts: number): Promise<T> {
  if (!Number.isInteger(attempts) || attempts < 1) {
    throw new RangeError('attempts must be a positive integer');
  }
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. Structural typing: FakePage has every method PageLike requires, with
//       compatible types. Yes, it works without `implements`, which only
//       adds an early check inside the class itself.
//   Q2. Parameter properties are not erasable syntax: they generate hidden
//       assignment code. Node's type stripping can't run them, and
//       erasableSyntaxOnly flags them. Explicit fields are clearer anyway.
//   Q3. `await loginPage.errorText()` reads the text ONCE. If the alert
//       renders a moment later, the value is '' and the test fails, only
//       sometimes: flaky. Expose the locator instead (`readonly errorAlert:
//       Locator`) and assert in the test with a web-first assertion that
//       retries: `await expect(loginPage.errorAlert).toHaveText('Wrong password')`.
//   Q4. Exact, readonly literal types and known keys (USERS.admin is an
//       error, autocomplete works), while still checking that every entry
//       is a valid Credentials. An annotation widens it to "any string key".
//   Q5. `login()` is not awaited: the URL assertion starts while the login is
//       still running (and a login failure would surface later, or never).
//       tsc only checks types, and ignoring a Promise is type-correct. The
//       linter catches it: @typescript-eslint/no-floating-promises, plus
//       eslint-plugin-playwright's missing-playwright-await for expect().
//
// Review answers
//   R1. Each test should state only what matters for it (`{ role: 'admin' }`)
//       and get valid defaults for the rest. A full TestUser would force
//       every test to repeat every field, hiding what the test is about.
//   R2. No. A module is evaluated once PER PROCESS, and every Playwright
//       worker is its own process, so each worker gets its own copy. Share
//       state with a worker-scoped fixture, or save it to a file (e.g.
//       storageState from a setup project).
//   R3. Catch only what you can actually handle, e.g. a specific
//       `errors.TimeoutError` for an optional cookie banner. Rethrow
//       everything else (or wrap it with `{ cause }`) so the test fails with
//       the real reason. Never swallow errors with an empty catch.
// ----------------------------------------------------------------------------

// ============================== TESTS ======================================
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
