/**
 * ============================================================================
 *  SOLUTIONS 11 — Classes
 * ============================================================================
 *  Run:  node course/01-javascript/11-classes/solutions.js
 *
 *  Compare these with YOUR solutions. If yours is different but the tests pass,
 *  it may be just as good. Read the WHY comments to see the trade-offs.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setTimeout as sleep } from 'node:timers/promises';

// Exercise 1
// WHY: #balance can only change through deposit(), which validates input.
// A getter without a setter makes `balance` read-only from the outside.
// Number.isFinite also rejects NaN, Infinity and non-numbers (Lesson 04).
class BankAccount {
  #balance = 0;

  constructor(owner) {
    this.owner = owner;
  }

  deposit(amount) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new RangeError(`Deposit must be a positive number, got ${amount}`);
    }
    this.#balance += amount;
  }

  get balance() {
    return this.#balance;
  }
}

// Exercise 2
// WHY: the counter belongs to the CLASS (static), not to any one ticket.
// Keeping it #private means only Ticket can hand out ids.
class Ticket {
  static #nextId = 0;

  static create(title) {
    Ticket.#nextId += 1;
    return new Ticket(Ticket.#nextId, title);
  }

  static reset() {
    Ticket.#nextId = 0;
  }

  constructor(id, title) {
    this.id = id;
    this.title = title;
  }
}

// Exercise 3
// WHY: super('rectangle') runs the parent constructor first, which sets
// `name`. super.describe() reuses the parent's logic instead of copying it.
class Shape {
  constructor(name) {
    this.name = name;
  }
  describe() {
    return this.name;
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super('rectangle');
    this.width = width;
    this.height = height;
  }

  area() {
    return this.width * this.height;
  }

  describe() {
    return `${super.describe()} with area ${this.area()}`;
  }
}

// Exercise 4
// WHY: locators are built ONCE with user-facing queries and exposed as public
// fields, so a test can write  await expect(searchPage.results).toContainText('...').
// The class only adds ACTIONS. A for...of loop with `await` runs the searches
// ONE AFTER ANOTHER, which is what UI steps need. forEach would fire them all
// at once (Lesson 13).
class SearchPage {
  constructor(page) {
    this.searchBox = page.getByRole('searchbox', { name: 'Search' });
    this.searchButton = page.getByRole('button', { name: 'Go' });
    this.results = page.getByTestId('results');
  }

  async search(term) {
    await this.searchBox.fill(term);
    await this.searchButton.click();
  }

  async searchAll(terms) {
    for (const term of terms) {
      await this.search(term);
    }
  }
}

// Exercise 5
// WHY: same behavior, but the class is strict, needs `new`, and keeps all its
// methods in one readable block. Returning `this` from lap() allows chaining.
class Timer {
  laps = [];

  constructor(label) {
    this.label = label;
  }

  lap(ms) {
    this.laps.push(ms);
    return this;
  }

  total() {
    return this.laps.reduce((sum, ms) => sum + ms, 0);
  }
}

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. `_balance` is only a naming convention: anyone can still read and
//       write it. `#balance` is enforced by the language and is invisible
//       outside the class body.
//   Q2. In a subclass, the PARENT constructor creates the object. Until
//       super() runs, `this` doesn't exist yet (ReferenceError).
//   Q3. A four-level chain is fragile: a change in BasePage ripples into every
//       page, and pages inherit methods they don't need. PREFER composition:
//       small component objects (Header, Sidebar, UserTable) that each page
//       HAS, plus at most one thin base class if there is truly shared
//       behavior.
//   Q4. For expose-a-locator: the test stays explicit and can pick any
//       assertion. For a helper with expect: the check is reused and named.
//       Playwright's guidance and most teams keep assertions in tests and
//       expose locators; add a named helper only when the SAME multi-step
//       check repeats in many tests.
//   Q5. Locators are lazy. Creating one only stores HOW to find the element.
//       Playwright resolves it when you act or assert, and auto-waits then.
//
// Review answers:
//   R1. setTimeout calls the function without `page.` in front, so `this` is
//       undefined. Fix: setTimeout(() => page.submit(), 0) or bind(page).
//   R2. An object with options.timeout: the later spread wins.
//   R3. Named options are self-documenting, order-independent, and you can add
//       optional fields (rememberMe) later without breaking existing calls.
// ----------------------------------------------------------------------------

// ============================== TESTS ======================================
const sourceOf = (fn) => fn.toString().replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');

// A fake page whose locators are really async (they wait 1 ms before
// recording), so a missing `await` shows up as missing or out-of-order actions.
const createFakePage = () => {
  const actions = [];
  const locator = (description) => ({
    description,
    fill: async (value) => {
      await sleep(1);
      actions.push(`fill ${description} = ${value}`);
    },
    click: async () => {
      await sleep(1);
      actions.push(`click ${description}`);
    },
  });
  return {
    actions,
    getByLabel: (label) => locator(`label "${label}"`),
    getByRole: (role, { name }) => locator(`${role} "${name}"`),
    getByTestId: (testId) => locator(`testid "${testId}"`),
  };
};

test('1. BankAccount: private balance with a read-only getter', () => {
  const account = new BankAccount('ada');
  account.deposit(50);
  account.deposit(25);
  assert.equal(account.owner, 'ada');
  assert.equal(account.balance, 75);
  assert.throws(() => account.deposit(-5), RangeError);
  assert.throws(() => account.deposit(0), RangeError);
  assert.deepEqual(Object.keys(account), ['owner'], 'balance must be #private');
  assert.throws(() => {
    account.balance = 1_000_000; // no setter -> TypeError in strict mode
  }, TypeError);
});

test('2. Ticket: static factory hands out increasing ids', () => {
  Ticket.reset();
  const first = Ticket.create('flaky login');
  const second = Ticket.create('slow checkout');
  assert.ok(first instanceof Ticket);
  assert.deepEqual([first.id, first.title], [1, 'flaky login']);
  assert.equal(second.id, 2);
  Ticket.reset();
  assert.equal(Ticket.create('again').id, 1);
});

test('3. Rectangle: extends Shape and overrides describe', () => {
  const rectangle = new Rectangle(2, 3);
  assert.ok(rectangle instanceof Shape);
  assert.equal(rectangle.area(), 6);
  assert.equal(rectangle.describe(), 'rectangle with area 6');
  assert.match(
    sourceOf(Rectangle),
    /super\s*\.\s*describe\s*\(/,
    'reuse the parent with super.describe()',
  );
});

test('4. SearchPage: exposes locators and drives them in order', async () => {
  const page = createFakePage();
  const searchPage = new SearchPage(page);
  await searchPage.searchAll(['locators', 'fixtures']);
  assert.deepEqual(page.actions, [
    'fill searchbox "Search" = locators',
    'click button "Go"',
    'fill searchbox "Search" = fixtures',
    'click button "Go"',
  ]);
  assert.equal(
    searchPage.results?.description,
    'testid "results"',
    'expose the results locator so tests can assert on it',
  );
});

test('5. Timer (bonus): rewritten as a class', () => {
  const timer = new Timer('suite');
  timer.lap(100).lap(250);
  assert.equal(timer.label, 'suite');
  assert.equal(timer.total(), 350);
  // Checking `Timer('no new')` throws would prove nothing here: in a module
  // the old constructor function ALSO throws (this is undefined). So the test
  // checks the source instead.
  assert.match(sourceOf(Timer).trim(), /^class\b/, 'Timer must be a class');
});
