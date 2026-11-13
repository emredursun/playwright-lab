# Lesson 23 — Playwright Capstone

Lessons 01–22 taught the language. This capstone turns that knowledge into a small, real **Playwright Test + TypeScript framework**: page objects, component objects, typed fixtures, typed test data, a saved login session, and web-first assertions.

There are two parts:

1. **Read and run** the reference framework in [`tests/capstone/`](../../../tests/capstone/).
2. **Build your own version** step by step in `tests/practice/`, using the rubric at the end to check your work.

## Goals

After this lesson you can:

1. Structure a Playwright project into pages, components, fixtures, data and specs, and explain why each layer exists.
2. Write page objects that expose `readonly` Locators and user-level actions, with no assertions inside them.
3. Write typed `test.extend` fixtures, including an option fixture and a worker-scoped fixture.
4. Log in once in a setup project and reuse the session with `storageState`.
5. Assert only with web-first assertions (`toHaveText`, `toHaveCount`, `toBeVisible`, `toHaveURL`), which retry.
6. Debug a failing test with the HTML report, the trace viewer, UI mode and the debugger.

## The practice site

The tests run against [saucedemo.com](https://www.saucedemo.com), a public shop built by Sauce Labs specifically for practicing test automation. It has login (including a locked-out user), a product list with sorting, a cart, a three-step checkout and form validation errors. Its demo credentials are printed on its own login page.

The base URL comes from `BASE_URL` (see [`playwright.config.ts`](../../../playwright.config.ts)) and defaults to `https://www.saucedemo.com`. You need an internet connection to run these tests.

## Run the reference suite

From the repository root:

```bash
npm run test:chromium                          # setup + chromium (fast feedback)
npm test                                       # setup + chromium, firefox, webkit
npx playwright test --grep @smoke              # only tests tagged @smoke
npx playwright test --grep-invert @smoke       # everything except @smoke
npx playwright test tests/capstone/specs/login.spec.ts   # one file
npm run report                                 # open the last HTML report
npm run test:ui                                # UI mode: watch, time-travel, pick locators
```

## Architecture

```
playwright.config.ts            baseURL, testIdAttribute, traces, projects
tests/
├── capstone/                   reference framework (read this)
│   ├── auth.setup.ts           logs in once, saves the session
│   ├── auth-state.ts           AUTH_FILE path + LOGGED_OUT state
│   ├── data/                   typed test data and factories
│   │   ├── users.ts            USERS        (as const satisfies)
│   │   ├── products.ts         PRODUCTS, SORT_OPTIONS, formatPrice()
│   │   └── factories.ts        createCustomer(overrides)
│   ├── components/             parts of a page, scoped to a root Locator
│   │   ├── HeaderComponent.ts
│   │   └── ProductCard.ts
│   ├── pages/                  one class per page: Locators + actions
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── CartPage.ts
│   │   └── CheckoutPage.ts
│   ├── fixtures/index.ts       test.extend: page objects, options, worker data
│   └── specs/                  the tests: intent + assertions only
│       ├── login.spec.ts
│       ├── inventory.spec.ts
│       └── checkout.spec.ts
├── examples/                   the original `npm init playwright` example
└── practice/                   YOUR version (you create it in step 1)
```

How a test run flows:

```
 [setup project] auth.setup.ts
        │  logs in through the UI once
        ▼
 playwright/.auth/user.json     (gitignored: a live session)
        │  storageState in each browser project
        ▼
 [chromium | firefox | webkit]  every test starts logged in
        │
        ▼
 spec ── asks for fixtures ──► fixtures/index.ts ──► new LoginPage(page), ...
   │                                                     │
   └── awaits actions, asserts on exposed Locators ◄─────┘
```

Each layer has one job:

| Layer      | Knows about               | Must NOT contain                     |
| ---------- | ------------------------- | ------------------------------------ |
| specs      | user intent, expectations | locators, CSS, waits, setup plumbing |
| fixtures   | how to build things       | test logic or assertions             |
| pages      | locators + actions        | assertions, test data                |
| components | one region of a page      | knowledge of the page around it      |
| data       | values and shapes         | browser code                         |

## Step-by-step: build your own

Work in `tests/practice/`, with the same sub-folders as `tests/capstone/`. Read the matching reference file only **after** you've tried each step yourself.

> **Commit or not?** Commit your practice folder on your own branch or fork, so your progress is saved. Don't push half-finished specs to `main`: CI runs everything under `tests/`. Mark unfinished tests with `test.fixme()` until they work.

Run only your own tests with:

```bash
npx playwright test tests/practice --project=chromium
```

`tests/practice/` doesn't match `*.setup.ts`, so your files run in the browser projects. They start logged in through the reference setup project.

### Step 1 — Explore the app and the reference suite

- Run `npm run test:chromium` and open the report with `npm run report`.
- Open the site with `npx playwright codegen https://www.saucedemo.com`. Hover elements to see the locators Playwright suggests.
- **Done when:** the suite is green, and you can explain what `testIdAttribute: 'data-test'` in the config changes.

Uses: [Lesson 14 — Modules](../../01-javascript/14-modules/) (how the files import each other).

### Step 2 — Typed test data

- Create `data/users.ts` with a `Credentials` interface and a `USERS` object using `as const satisfies Record<string, Credentials>`.
- Create `data/factories.ts` with `createCustomer(overrides: Partial<Customer> = {})`. Make the default data unique on every call.
- **Done when:** `npm run typecheck` passes, and a typo like `USERS.standrd` is a type error.

Uses: [17](../../02-typescript/17-typescript-basics/), [18](../../02-typescript/18-types-interfaces-and-unions/), [19](../../02-typescript/19-generics-and-utility-types/), [09 — Objects](../../01-javascript/09-objects/) (spread for overrides).

### Step 3 — The LoginPage object

- Expose `readonly` Locators: `usernameInput`, `passwordInput`, `loginButton`, `errorMessage`.
- Use `getByRole` first. Use `getByTestId` only when there is no accessible role or name.
- Add async actions: `goto()` and `login(credentials)`.
- **Done when:**
  - The class contains no `expect`, no CSS selectors and no `page.fill('#id')`-style calls.
  - Fields are assigned explicitly, with no constructor parameter properties.

Uses: [11 — Classes](../../01-javascript/11-classes/), [20 — TypeScript for Playwright](../../02-typescript/20-typescript-for-playwright/).

### Step 4 — A component object

- Write `ProductCard`, which takes a **root Locator** (one card) instead of the page. Every locator inside it is scoped to that root.
- In `InventoryPage`, add `product(name)` that returns `new ProductCard(this.productCards.filter({ hasText: name }))`.
- **Done when:** a spec can say `await inventoryPage.product('Sauce Labs Onesie').addToCart()`.

Uses: [11 — Classes](../../01-javascript/11-classes/) (composition over inheritance), [16 — Clean Code](../../01-javascript/16-clean-code/).

### Step 5 — Fixtures

- In `fixtures/index.ts`, use `base.extend<TestFixtures & Options, WorkerFixtures>()` to provide your page objects.
- Add one **option** fixture (`[defaultValue, { option: true }]`) and one **worker-scoped** fixture (`{ scope: 'worker' }`).
- Specs import `test` and `expect` from your fixtures file, never from `@playwright/test`.
- **Done when:** your specs have no `new LoginPage(page)` lines and no page-object setup in `beforeEach`.

Uses: [07 — Functions](../../01-javascript/07-functions/), [10 — Closures](../../01-javascript/10-scope-closures-and-this/), [13 — Async](../../01-javascript/13-async-javascript/), [20](../../02-typescript/20-typescript-for-playwright/).

### Step 6 — Log in once with a setup project

- Write a `*.setup.ts` that logs in, **asserts** the login worked, then calls `page.context().storageState({ path })`.
- Tests that must start logged out use `test.use({ storageState: { cookies: [], origins: [] } })`.
- **Done when:**
  - Inventory and checkout tests contain no login steps.
  - Login tests still start logged out.
  - `playwright/.auth/` is not committed.

Uses: [13 — Async](../../01-javascript/13-async-javascript/), [22 — Node: Files, HTTP & Config](../22-node-files-http-and-config/).

### Step 7 — Specs with web-first assertions

- Write login tests:
  - success
  - locked-out user
  - data-driven validation: a `for...of` over cases, each with its own test name
  - opening a protected page without logging in
- Write inventory tests: sorting with `toHaveText([...expected])`, and the cart badge appearing and disappearing.
- Tag the critical paths with `{ tag: '@smoke' }` and run them with `--grep @smoke`.
- **Done when:**
  - No assertion reads `textContent()`, `innerText()`, `isVisible()` or `count()` and then compares it with a plain `expect(value)`.
  - Every assertion is `await expect(locator)...` or `await expect(page)...`.

Uses: [06 — Loops](../../01-javascript/06-loops-and-iteration/), [08 — Arrays](../../01-javascript/08-arrays/) (`toSorted` with a comparator), [21 — Testing Fundamentals](../21-testing-fundamentals/) (Arrange-Act-Assert, one behavior per test).

### Step 8 — An end-to-end flow with steps

- Write a checkout test in which `test.step()` groups the stages: add products, review the cart, enter details, confirm the total and finish.
- Compute the expected total from your data in **cents** (`29.99 + 9.99` must be exactly `$39.98`).
- **Done when:** the HTML report shows your named steps, and changing a price in the data file makes the test fail with a readable message.

Uses: [04 — Numbers](../../01-javascript/04-numbers-and-math/), [21 — Testing Fundamentals](../21-testing-fundamentals/).

### Step 9 — Break it and read the trace

Learn the debugging tools while you know exactly what is wrong.

1. In one of your specs, change an expected text, for example `'Products'` to `'Product list'`. Run it:
   ```bash
   npx playwright test tests/practice --project=chromium
   ```
2. Open the HTML report with `npm run report`. Read the error, the expected vs received values, the screenshot and the video.
3. Open the trace. Locally, a trace is kept for every failure (`trace: 'retain-on-failure'`):
   ```bash
   npx playwright show-trace test-results/<test-folder>/trace.zip
   ```
   Step through the actions. Check the DOM snapshot before and after each one, the network tab and the console.
4. Run the same test in UI mode (`npm run test:ui`) and in the debugger (`npm run test:debug`). Add `await page.pause()` before the failing line to inspect the live page.
5. Install the **Playwright Test for VS Code** extension. Run a single test from the gutter, set a breakpoint, and use "Pick locator".
6. Fix the expectation, then remove the `page.pause()`.

**Done when:** you can find the failing step in a trace without reading the test code first.

Uses: [12 — Error Handling](../../01-javascript/12-error-handling/) (reading errors and stack traces).

### Step 10 — Let lint guard the rules

The repo's ESLint config includes `typescript-eslint` (type-checked) and `eslint-plugin-playwright`. Try it on purpose: in a practice spec, remove one `await`, add `await page.waitForTimeout(1000)` and assert on `textContent()`. Then run:

```bash
npm run lint
```

- **Done when:** you have seen `no-floating-promises`, `missing-playwright-await`, `no-wait-for-timeout` and `prefer-web-first-assertions` reported, restored the code, and `npm run lint` and `npm run typecheck` both pass.

Uses: [16 — Clean Code](../../01-javascript/16-clean-code/), [13 — Async](../../01-javascript/13-async-javascript/) (the missing-`await` bug).

## Rubric

Check your `tests/practice/` against this list. Every box should be ticked.

- [ ] `npx playwright test tests/practice --project=chromium` is green, and stays green with `--repeat-each=3`.
- [ ] `npm run typecheck` and `npm run lint` pass.
- [ ] Page objects expose `readonly` Locators and async actions, with no `expect` inside them.
- [ ] Locators use roles and accessible names first and test ids second. No CSS or XPath selectors.
- [ ] At least one component object takes a root `Locator`.
- [ ] Specs import `test` and `expect` from your fixtures file.
- [ ] There is at least one option fixture and one worker-scoped fixture.
- [ ] You log in once in a setup project, and logged-out tests override `storageState`.
- [ ] Only web-first assertions: no `textContent()`, `isVisible()` or `count()` compared with a plain `expect`.
- [ ] No `page.waitForTimeout()`, and no `sleep` of any kind.
- [ ] Test data is typed (`as const satisfies`), and default factory data is unique on every call.
- [ ] Each test checks one behavior, has a name that describes that behavior, and doesn't depend on another test.
- [ ] `@smoke` tags are on the critical paths, and `--grep @smoke` runs them.
- [ ] No real secrets in the code. Anything secret comes from the environment (Lesson 22).

## How this connects to the Udemy course

The "Playwright: From Zero to Hero" course builds a framework against its own demo apps and covers its topics in its own order. This capstone is independent: it uses a different public practice site and contains no course material. The two support each other:

| Course topic                       | Where you practiced it here                  |
| ---------------------------------- | -------------------------------------------- |
| Locators and user-facing selectors | Steps 3–4, page and component objects        |
| Assertions and auto-waiting        | Step 7, web-first assertions only            |
| Page Object Model                  | Steps 3–4                                    |
| Fixtures and test organization     | Step 5                                       |
| Authentication and saved state     | Step 6                                       |
| Test data and data-driven tests    | Steps 2 and 7                                |
| Debugging, reports and traces      | Step 9                                       |
| Configuration, projects, CI        | `playwright.config.ts`, `.github/workflows/` |

When the course reaches a topic, compare its approach with the matching step here. Where they differ, look up the current Playwright docs and decide which is better and why. Doing that teaches more than copying either one.

## Stretch goals

- **API setup:** in a project whose app has an API, create test data with the `request` fixture (`await request.post(...)`, then `await expect(response).toBeOK()`) instead of clicking through the UI. Lesson 22 covers the HTTP and JSON side.
- **Combine fixture sets:** use `mergeTests()` to combine two fixture files.
- **Typed config options:** add a project in `playwright.config.ts` that overrides your option fixture, typed with `defineConfig<YourOptions>`.
- **Mobile viewport:** run the smoke tests on a mobile device, for example `devices['Pixel 7']`.
- **Visual checks:** add a visual regression check with `await expect(page).toHaveScreenshot()`. Think first about what makes screenshots flaky across operating systems.
