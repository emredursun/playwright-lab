/**
 * ============================================================================
 *  EXERCISES 11 — Classes
 * ============================================================================
 *  Run:  node course/01-javascript/11-classes/exercises.js
 *
 *  How to work:
 *    1. Replace each `throw new Error('TODO')` with your solution.
 *    2. Run the file. Every test must pass (✔). Failing tests show what's wrong.
 *    3. Answer the self-check questions in your head or on paper.
 *    4. Only THEN compare with solutions.js.
 *
 *  Struggling a bit is good: it's how memory is built. Give each exercise at
 *  least 10 minutes before you peek.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setTimeout as sleep } from 'node:timers/promises';

// ----------------------------------------------------------------------------
// Exercise 1 — A class with a private field and a getter
// BankAccount:
//   - constructor(owner) stores `owner` as a public property, balance starts at 0
//   - deposit(amount) adds to a #private balance; throws a RangeError when the
//     amount is not a positive number
//   - get balance() returns the private balance (there is NO setter)
// ----------------------------------------------------------------------------
class BankAccount {
  constructor(owner) {
    throw new Error('TODO');
  }
}

// ----------------------------------------------------------------------------
// Exercise 2 — Static factory and static counter
// Ticket:
//   - static create(title) returns a new Ticket with ids 1, 2, 3, ... in order
//   - every ticket has public `id` and `title`
//   - static reset() sets the id counter back to 0 (used by the tests)
// Hint: a `static #nextId` field.
// ----------------------------------------------------------------------------
class Ticket {
  static create(title) {
    throw new Error('TODO');
  }

  static reset() {
    throw new Error('TODO');
  }
}

// ----------------------------------------------------------------------------
// Exercise 3 — Inheritance with an override
// `Shape` is given. Write `Rectangle extends Shape` with width and height:
//   - constructor(width, height) calls super('rectangle')
//   - area() returns width * height
//   - describe() returns the parent's description + ` with area ${area}`
//     e.g. 'rectangle with area 6'  (use super.describe())
// ----------------------------------------------------------------------------
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
    throw new Error('TODO');
  }
}

// ----------------------------------------------------------------------------
// Exercise 4 — Page object with locators (fake page)
// Write a SearchPage class in the modern Playwright style:
//   - constructor(page) creates three PUBLIC locator fields:
//       searchBox    = page.getByRole('searchbox', { name: 'Search' })
//       searchButton = page.getByRole('button', { name: 'Go' })
//       results      = page.getByTestId('results')
//   - async search(term): fill the search box with term, then click the button
//   - async searchAll(terms): searches every term IN ORDER (one at a time)
// The fake page in the tests records every locator action. Its actions are
// truly async, so every missing `await` makes the test fail.
// ----------------------------------------------------------------------------
class SearchPage {
  constructor(page) {
    throw new Error('TODO');
  }
}

// ----------------------------------------------------------------------------
// Exercise 5 (bonus) — Refactor a constructor function to a class
// Rewrite `Timer` as a class with the same behavior. The tests check that it
// IS a class.
// ----------------------------------------------------------------------------
function Timer(label) {
  this.label = label;
  this.laps = [];
}
Timer.prototype.lap = function (ms) {
  this.laps.push(ms);
  return this;
};
Timer.prototype.total = function () {
  return this.laps.reduce((sum, ms) => sum + ms, 0);
};

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.js)
//   Q1. What is the difference between `_balance` and `#balance`?
//   Q2. Why must a subclass constructor call super() before touching `this`?
//   Q3. A teammate proposes BasePage -> AuthenticatedPage -> AdminPage ->
//       AdminUsersPage. What problems do you expect, and what would you do
//       instead?
//   Q4. Should a page object method be `async expectLoggedIn()` with an
//       expect inside, or should it expose a locator? Argue both sides, then
//       pick one.
//   Q5. Why are locators created in the constructor safe, even though the
//       page hasn't loaded those elements yet?
//
// Review (earlier lessons):
//   R1. (Lesson 10) Why does `setTimeout(page.submit, 0)` lose `this`, and
//       how do you fix it?
//   R2. (Lesson 09) What does `{ ...defaults, ...options }` produce when both
//       contain `timeout`?
//   R3. (Lesson 07) Why is an options object `login({ email, password })`
//       better than `login(email, password)` as a page object API grows?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
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
