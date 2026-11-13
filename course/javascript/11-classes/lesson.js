/**
 * ============================================================================
 *  LESSON 11 — Classes
 * ============================================================================
 *  Run:       node course/javascript/11-classes/lesson.js
 *  Practice:  node course/javascript/11-classes/exercises.js
 *
 *  After this lesson you can:
 *    1. Write a class with a constructor, fields, methods, getters and setters.
 *    2. Hide internals with #private fields and methods.
 *    3. Use static members and inheritance (extends, super, overriding).
 *    4. Prefer composition over deep inheritance.
 *    5. Build a page-object-style class like the ones you'll write in Playwright.
 *
 *  How to study this file:
 *    - Every example has a numbered PREDICT comment. Write down your guess,
 *      run the file, then check the ANSWER KEY at the bottom.
 *    - Then close this file and solve exercises.js from memory.
 * ============================================================================
 */

const section = (title) => console.log(`\n--- ${title} ---`);

// ----------------------------------------------------------------------------
section('1. Class basics: a blueprint for objects');
// ----------------------------------------------------------------------------
// Mental model: a class is a COOKIE CUTTER. Every `new` stamps out an object
// (an instance) with the same shape and behavior but its own data.

class TestResult {
  constructor(title, durationMs) {
    this.title = title;
    this.durationMs = durationMs;
  }

  describe() {
    return `${this.title} (${this.durationMs} ms)`;
  }
}

const result = new TestResult('login works', 850);
console.log(result.describe()); // PREDICT #1
console.log(result instanceof TestResult); // PREDICT #2
console.log(typeof TestResult); // PREDICT #3

// ----------------------------------------------------------------------------
section('2. Class fields: declare state up front');
// ----------------------------------------------------------------------------
// Public fields declare the object's shape at the top of the class, so readers
// see it at a glance, and defaults don't need a constructor.
class RetryPolicy {
  maxRetries = 3;
  attempts = 0;

  canRetry() {
    return this.attempts < this.maxRetries;
  }
}
const policy = new RetryPolicy();
policy.attempts = 3;
console.log(policy.canRetry()); // PREDICT #4

// ----------------------------------------------------------------------------
section('3. #private fields and methods');
// ----------------------------------------------------------------------------
// `#name` is truly private: code outside the class body can't read it,
// and trying is a SyntaxError. The old `_name` convention was only a hint.
class Stopwatch {
  #startedAt = null;
  #elapsedMs = 0;

  start(now) {
    this.#startedAt = now;
  }

  stop(now) {
    this.#elapsedMs += this.#since(now);
    this.#startedAt = null;
  }

  #since(now) {
    return now - this.#startedAt;
  }

  get elapsedMs() {
    return this.#elapsedMs;
  }
}

const watch = new Stopwatch();
watch.start(1_000);
watch.stop(1_750);
console.log(watch.elapsedMs); // PREDICT #5
console.log(Object.keys(watch)); // PREDICT #6
// watch.#elapsedMs  -> SyntaxError: Private field '#elapsedMs' must be declared in an enclosing class

// ----------------------------------------------------------------------------
section('4. Getters and setters: properties with rules');
// ----------------------------------------------------------------------------
class Viewport {
  #width = 1280;

  get width() {
    return this.#width;
  }

  set width(value) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new RangeError(`Invalid width: ${value}`);
    }
    this.#width = value;
  }

  get isMobile() {
    return this.#width < 768; // a computed, read-only property
  }
}

const viewport = new Viewport();
viewport.width = 375; // looks like a property, runs the setter's checks
console.log(viewport.width, viewport.isMobile); // PREDICT #7
try {
  viewport.width = -1;
} catch (error) {
  console.log(error.message); // PREDICT #8
}

// ----------------------------------------------------------------------------
section('5. Static members: belong to the class, not to instances');
// ----------------------------------------------------------------------------
class Browser {
  static SUPPORTED = ['chromium', 'firefox', 'webkit'];

  static isSupported(name) {
    return Browser.SUPPORTED.includes(name);
  }

  // A static factory gives creation a meaningful name.
  static chromium() {
    return new Browser('chromium');
  }

  constructor(name) {
    this.name = name;
  }
}
console.log(Browser.isSupported('webkit')); // PREDICT #9
console.log(Browser.chromium().name); // PREDICT #10
console.log(new Browser('firefox').SUPPORTED); // PREDICT #11

// ----------------------------------------------------------------------------
section('6. Inheritance: extends, super and override');
// ----------------------------------------------------------------------------
class Notifier {
  constructor(channel) {
    this.channel = channel;
  }

  format(message) {
    return `[${this.channel}] ${message}`;
  }
}

class UrgentNotifier extends Notifier {
  constructor(channel) {
    super(channel); // MUST be called before using `this` in a subclass
    this.level = 'urgent';
  }

  // Override: same name, new behavior, reusing the parent's with super.
  format(message) {
    return `${super.format(message)} !!!`;
  }
}

const urgent = new UrgentNotifier('ci');
console.log(urgent.format('build failed')); // PREDICT #12
console.log(urgent instanceof Notifier); // PREDICT #13

// ----------------------------------------------------------------------------
section('7. Composition over inheritance');
// ----------------------------------------------------------------------------
// Inheritance says "IS A". Composition says "HAS A". Deep inheritance chains
// get fragile: changing a parent breaks every child. Most of the time it's
// better to give an object the helpers it needs.
//
// A tiny FAKE page so sections 7 and 8 run without a browser. Like real
// Playwright, its getBy* methods return LOCATORS: objects you act on later.
const createFakePage = () => {
  const actions = [];
  const locator = (description) => ({
    description,
    fill: async (value) => {
      actions.push(`fill ${description} = ${value}`);
    },
    click: async () => {
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

// A COMPONENT object: a piece of UI that appears on many pages.
class Header {
  constructor(page) {
    this.logoutButton = page.getByRole('button', { name: 'Log out' });
  }

  async logout() {
    await this.logoutButton.click();
  }
}

class DashboardPage {
  constructor(page) {
    this.header = new Header(page); // HAS A header, instead of extending it
  }
}

const composed = new DashboardPage(createFakePage());
console.log(composed.header instanceof Header, composed instanceof Header); // PREDICT #14
// DashboardPage is not a Header. It just has one, so the two can change
// independently, and every page that shows the header can reuse it.

// ----------------------------------------------------------------------------
section('8. Playwright-style page object (with a fake page)');
// ----------------------------------------------------------------------------
// The modern Playwright page object:
//   - builds LOCATORS in the constructor with user-facing queries
//     (getByRole, getByLabel, getByTestId), never CSS ids like '#email',
//   - exposes those locators as PUBLIC fields, so tests can assert on them
//     with web-first assertions:  await expect(loginPage.errorMessage).toBeVisible();
//   - offers ACTIONS as methods (login), but leaves ASSERTIONS to the test.
//
// Locators are LAZY: creating one doesn't touch the page. Playwright finds the
// element only when you act or assert, and it re-finds and auto-waits every
// time. That's why building them up front in the constructor is safe.
//
// AVOID (outdated): page.fill('#email', ...) / page.click('button#submit').
// CSS selectors break when markup changes, and the page-level fill/click
// methods are discouraged in favor of locators.
class LoginPage {
  // Public fields: part of the page object's API. (In TypeScript you'd mark
  // them `readonly`, Lesson 20.)
  emailInput;
  passwordInput;
  submitButton;
  errorMessage;

  constructor(page) {
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Log in' });
    this.errorMessage = page.getByTestId('login-error');
  }

  async login({ email, password }) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

const fakePage = createFakePage();
const loginPage = new LoginPage(fakePage);
const dashboard = new DashboardPage(fakePage);
await loginPage.login({ email: 'ada@test.dev', password: 's3cret' });
await dashboard.header.logout();
console.log(fakePage.actions);
// PREDICT #15
console.log(loginPage.errorMessage.description); // PREDICT #16

// ----------------------------------------------------------------------------
section('9. Outdated: constructor functions and prototypes');
// ----------------------------------------------------------------------------
// AVOID (pre-2015 style):
//   function Person(name) { this.name = name; }
//   Person.prototype.greet = function () { return 'Hi ' + this.name; };
// PREFER the class syntax: same mechanism underneath, far more readable.
// It also runs in strict mode, needs `new`, and supports #private and static.
class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    return `Hi ${this.name}`;
  }
}
try {
  Person('ada'); // forgetting `new` fails loudly with a class
} catch (error) {
  console.log(error.name); // PREDICT #17
}
console.log(new Person('ada').greet()); // PREDICT #18

console.log('Done. Now open exercises.js and practice from memory!');

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - Declare state with class fields. Use #private for internals, not _name.
 *    - Getters/setters let a property run logic (validation, computed values).
 *    - static = on the class itself. Great for constants and factories.
 *    - extends + super() for real "is a" relationships. Override with
 *      super.method() when you need the parent's behavior.
 *    - Prefer composition ("has a") over deep inheritance chains.
 *    - Page objects: locators as public fields, actions as methods,
 *      assertions in the test.
 *
 *  In Playwright:
 *    export class LoginPage {
 *      constructor(page) {
 *        this.emailInput = page.getByLabel('Email');
 *        this.submitButton = page.getByRole('button', { name: 'Log in' });
 *      }
 *      async login(email) {
 *        await this.emailInput.fill(email);
 *        await this.submitButton.click();
 *      }
 *    }
 *    // In the test:  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1   login works (850 ms)
 *   #2   true
 *   #3   function  (classes are special functions)
 *   #4   false
 *   #5   750
 *   #6   []  (private fields are invisible)
 *   #7   375 true
 *   #8   Invalid width: -1
 *   #9   true
 *   #10  chromium
 *   #11  undefined
 *   #12  [ci] build failed !!!
 *   #13  true
 *   #14  true false
 *   #15  [
 *          'fill label "Email" = ada@test.dev',
 *          'fill label "Password" = s3cret',
 *          'click button "Log in"',
 *          'click button "Log out"'
 *        ]
 *   #16  testid "login-error"   (a test would assert on this locator)
 *   #17  TypeError
 *   #18  Hi ada
 * ============================================================================
 */
