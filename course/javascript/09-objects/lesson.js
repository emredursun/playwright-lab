/**
 * ============================================================================
 *  LESSON 09 — Objects
 * ============================================================================
 *  Run:       node course/javascript/09-objects/lesson.js
 *  Practice:  node course/javascript/09-objects/exercises.js
 *
 *  After this lesson you can:
 *    1. Write object literals with shorthand properties, methods and computed keys.
 *    2. Destructure with renaming, defaults, nesting and rest.
 *    3. Merge objects with spread and predict which value wins.
 *    4. Convert between objects and arrays (keys/values/entries/fromEntries).
 *    5. Check properties safely (?. , `in`, Object.hasOwn).
 *    6. Copy objects correctly: shallow spread vs deep structuredClone.
 *
 *  How to study this file:
 *    - Every example has a numbered PREDICT comment. Write down your guess,
 *      run the file, then check the ANSWER KEY at the bottom.
 *    - Then close this file and solve exercises.js from memory.
 * ============================================================================
 */

const section = (title) => console.log(`\n--- ${title} ---`);

// ----------------------------------------------------------------------------
section('1. Object literals: shorthand and methods');
// ----------------------------------------------------------------------------
const name = 'ada';
const role = 'admin';

// AVOID: { name: name, role: role, greet: function () { ... } }
// PREFER shorthand properties and method syntax:
const user = {
  name,
  role,
  greet() {
    return `Hi, I'm ${this.name}`;
  },
};
console.log(user.greet()); // PREDICT #1

// Dot notation for known names, brackets for dynamic names or odd characters:
const field = 'role';
console.log(user.name, user[field]); // PREDICT #2

// ----------------------------------------------------------------------------
section('2. Computed keys');
// ----------------------------------------------------------------------------
// Put an expression in [ ] to use its value as the key:
const browserName = 'firefox';
const timeouts = {
  [browserName]: 45_000,
  [`${browserName}Mobile`]: 60_000,
};
console.log(timeouts); // PREDICT #3

// ----------------------------------------------------------------------------
section('3. Destructuring: rename, defaults, nesting, rest');
// ----------------------------------------------------------------------------
const response = {
  status: 200,
  body: { id: 7, email: 'ada@example.com' },
  headers: { 'content-type': 'application/json' },
};

// Rename with `original: newName`, add defaults with `=`:
const { status: statusCode, retries = 0 } = response;
console.log(statusCode, retries); // PREDICT #4

// Nested: reach inside in one step (only when the shape is guaranteed):
const {
  body: { email },
} = response;
console.log(email); // PREDICT #5

// Rest collects "everything else" into a new object:
const { headers, ...withoutHeaders } = response;
console.log(Object.keys(withoutHeaders)); // PREDICT #6

// ----------------------------------------------------------------------------
section('4. Spread: copy and merge (last one wins)');
// ----------------------------------------------------------------------------
const defaults = { headless: true, timeout: 30_000, viewport: { width: 1280 } };
const overrides = { timeout: 5_000 };

const settings = { ...defaults, ...overrides };
console.log(settings.timeout); // PREDICT #7

const wrongOrder = { ...overrides, ...defaults };
console.log(wrongOrder.timeout); // PREDICT #8

// RULE: defaults first, overrides last.

// ----------------------------------------------------------------------------
section('5. Object.keys / values / entries / fromEntries');
// ----------------------------------------------------------------------------
const durations = { login: 1_200, cart: 4_800, search: 900 };

console.log(Object.keys(durations)); // PREDICT #9
console.log(Object.values(durations)); // PREDICT #10

// The power pattern: object -> entries -> array methods -> fromEntries -> object
const inSeconds = Object.fromEntries(
  Object.entries(durations).map(([testName, ms]) => [testName, ms / 1_000]),
);
console.log(inSeconds); // PREDICT #11

const slowOnly = Object.fromEntries(Object.entries(durations).filter(([, ms]) => ms > 1_000));
console.log(slowOnly); // PREDICT #12

// ----------------------------------------------------------------------------
section('6. Optional chaining and checking properties');
// ----------------------------------------------------------------------------
const config = { use: { baseURL: 'http://localhost:4200' } };

// AVOID: config && config.use && config.use.trace
// PREFER optional chaining: stops and returns undefined if something is missing.
console.log(config.use?.baseURL); // PREDICT #13
console.log(config.webServer?.url); // PREDICT #14
console.log(config.webServer?.url ?? 'no web server'); // PREDICT #15

// Does a property exist? (Even if its value is undefined.)
const options = { trace: undefined };
console.log('trace' in options); // PREDICT #16
console.log(Object.hasOwn(options, 'trace')); // PREDICT #17
console.log('toString' in options, Object.hasOwn(options, 'toString')); // PREDICT #18

// AVOID: options.hasOwnProperty('trace') — it breaks for objects created with
// Object.create(null) or ones that have their own "hasOwnProperty" key.
const bare = Object.create(null);
bare.id = 1;
console.log(typeof bare.hasOwnProperty, Object.hasOwn(bare, 'id')); // PREDICT #19

// ----------------------------------------------------------------------------
section('7. Shallow vs deep copy');
// ----------------------------------------------------------------------------
// Spread copies only the TOP level. Nested objects are still SHARED.
const shallow = { ...defaults };
shallow.viewport.width = 375;
console.log(defaults.viewport.width); // PREDICT #20
defaults.viewport.width = 1280; // undo for the next example

// PREFER structuredClone for a real deep copy:
const deep = structuredClone(defaults);
deep.viewport.width = 375;
console.log(defaults.viewport.width, deep.viewport.width); // PREDICT #21

// AVOID: JSON.parse(JSON.stringify(obj)) as a deep copy. It loses Dates,
// undefined values, Maps, Sets... structuredClone handles them.
const withDate = { createdAt: new Date(0), note: undefined };
console.log(JSON.parse(JSON.stringify(withDate))); // PREDICT #22
console.log(structuredClone(withDate).createdAt instanceof Date); // PREDICT #23

// LIMITS: structuredClone copies DATA only. It throws on functions and drops
// class prototypes (the copy loses its methods). So don't use it on configs
// that contain callbacks, or on page objects (Lesson 11).
try {
  structuredClone({ onRetry: () => 'retry' });
} catch (error) {
  console.log(error.name); // PREDICT #24
}
class Point {
  x = 1;
  describe() {
    return `x=${this.x}`;
  }
}
const clonedPoint = structuredClone(new Point());
console.log(clonedPoint instanceof Point, typeof clonedPoint.describe); // PREDICT #25

// ----------------------------------------------------------------------------
section('8. JSON: talking to APIs');
// ----------------------------------------------------------------------------
// JSON.stringify -> object to text (send it). JSON.parse -> text to object.
const payload = { email: 'ada@example.com', remember: true };
const text = JSON.stringify(payload);
console.log(text); // PREDICT #26
console.log(JSON.parse(text).remember); // PREDICT #27

// Pretty print for logs and files: the third argument is the indentation.
console.log(JSON.stringify({ id: 1 }, null, 2));
// PREDICT #28

// ----------------------------------------------------------------------------
section('9. Getters: computed properties');
// ----------------------------------------------------------------------------
// A getter looks like a property but runs a function each time it's read.
const run = {
  passed: 8,
  failed: 2,
  get total() {
    return this.passed + this.failed;
  },
  get passRate() {
    return `${Math.round((this.passed / this.total) * 100)}%`;
  },
};
console.log(run.total, run.passRate); // PREDICT #29
run.failed = 0;
console.log(run.passRate); // PREDICT #30

console.log('Done. Now open exercises.js and practice from memory!');

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - Shorthand: { name, greet() {} }. Computed keys: { [key]: value }.
 *    - Destructure with rename ({ a: b }), defaults (= x) and rest (...others).
 *    - Spread merges objects; the LAST one wins: { ...defaults, ...overrides }.
 *    - entries -> map/filter -> fromEntries transforms objects.
 *    - Use ?. for optional data and Object.hasOwn for "is this my property?".
 *    - Spread is a shallow copy; structuredClone is a deep copy of DATA
 *      (no functions, no class instances).
 *    - For real API responses, validate the shape before trusting it
 *      (Lesson 18: type guards, Lesson 22: HTTP & JSON).
 *
 *  In Playwright:
 *    use: { ...devices['Desktop Chrome'], baseURL }       // spread + shorthand
 *    test('profile', async ({ page, request }) => { ... });  // destructuring
 *                                                            // the fixtures!
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1   Hi, I'm ada
 *   #2   ada admin
 *   #3   { firefox: 45000, firefoxMobile: 60000 }
 *   #4   200 0
 *   #5   ada@example.com
 *   #6   [ 'status', 'body' ]
 *   #7   5000   (later spread wins)
 *   #8   30000  (defaults overwrote the override!)
 *   #9   [ 'login', 'cart', 'search' ]
 *   #10  [ 1200, 4800, 900 ]
 *   #11  { login: 1.2, cart: 4.8, search: 0.9 }
 *   #12  { login: 1200, cart: 4800 }
 *   #13  http://localhost:4200
 *   #14  undefined  (no crash)
 *   #15  no web server
 *   #16  true   (includes inherited keys)
 *   #17  true   (own keys only)
 *   #18  true false
 *   #19  undefined true
 *   #20  375   (the original changed!)
 *   #21  1280 375
 *   #22  { createdAt: '1970-01-01T00:00:00.000Z' }   (Date became a string, `note` vanished)
 *   #23  true
 *   #24  DataCloneError
 *   #25  false undefined   (a plain object now)
 *   #26  {"email":"ada@example.com","remember":true}
 *   #27  true
 *   #28  {
 *          "id": 1
 *        }
 *   #29  10 80%
 *   #30  100%  (always up to date, no stale copy)
 * ============================================================================
 */
