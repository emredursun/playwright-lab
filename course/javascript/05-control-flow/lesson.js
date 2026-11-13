/**
 * ============================================================================
 *  LESSON 05 — Control Flow
 * ============================================================================
 *  Run:       node course/javascript/05-control-flow/lesson.js
 *  Practice:  node course/javascript/05-control-flow/exercises.js
 *
 *  After this lesson you can:
 *    1. Write clear if/else conditions with well-named booleans.
 *    2. Flatten nested code with guard clauses and early returns.
 *    3. Use the ternary operator — and know when NOT to.
 *    4. Choose between switch and an object lookup table.
 *    5. Use short-circuiting and logical assignment (??=, ||=, &&=).
 *
 *  How to study this file:
 *    - Every example has a numbered PREDICT comment. Write down your guess,
 *      run the file, then check the ANSWER KEY at the bottom.
 *    - Every surprise is a learning moment: re-read that example.
 *    - Then close this file and solve exercises.js from memory.
 * ============================================================================
 */

const section = (title) => console.log(`\n--- ${title} ---`);

// ----------------------------------------------------------------------------
section('1. if / else with readable conditions');
// ----------------------------------------------------------------------------
const testResult = { status: 'failed', retries: 2, durationMs: 7_500 };

// AVOID: long conditions that the reader has to decode.
if (testResult.status === 'failed' && testResult.retries > 0 && testResult.durationMs > 5_000) {
  console.log('flaky and slow'); // PREDICT #1
}

// PREFER: name each part of the condition with a const (Lesson 01).
const MAX_DURATION_MS = 5_000;
const isFailed = testResult.status === 'failed';
const wasRetried = testResult.retries > 0;
const isSlow = testResult.durationMs > MAX_DURATION_MS;

if (isFailed && wasRetried && isSlow) {
  console.log('flaky and slow'); // PREDICT #2
}

// ALWAYS use braces { }, even for one line inside else/else-if chains. It
// prevents bugs when someone adds a second line later.
// (A single-line guard like `if (!user) return;` is a common exception.)

// ----------------------------------------------------------------------------
section('2. Guard clauses: exit early, stay flat');
// ----------------------------------------------------------------------------
// AVOID the "arrow of doom": every check adds one more level of nesting.
function getDiscountNested(user) {
  if (user) {
    if (user.isActive) {
      if (user.orders > 10) {
        return 0.2;
      } else {
        return 0.1;
      }
    } else {
      return 0;
    }
  } else {
    return 0;
  }
}

// PREFER guard clauses: handle the special cases first and return.
// The "happy path" ends up at the bottom, without indentation.
function getDiscount(user) {
  if (!user) return 0;
  if (!user.isActive) return 0;
  if (user.orders > 10) return 0.2;
  return 0.1;
}

const loyalUser = { isActive: true, orders: 12 };
console.log(getDiscountNested(loyalUser), getDiscount(loyalUser)); // PREDICT #3
console.log(getDiscount(null), getDiscount({ isActive: false })); // PREDICT #4

// Guard clauses also make errors obvious (more in Lesson 12):
function login(username) {
  if (typeof username !== 'string' || username.trim() === '') {
    throw new Error('username is required');
  }
  return `Welcome, ${username}`;
}
console.log(login('ada')); // PREDICT #5

// ----------------------------------------------------------------------------
section('3. The ternary operator');
// ----------------------------------------------------------------------------
// condition ? valueIfTrue : valueIfFalse — an EXPRESSION that returns a value.
const passed = 9;
const total = 10;
const verdict = passed === total ? 'all green' : 'needs attention';
console.log(verdict); // PREDICT #6

// AVOID nested ternaries: hard to read and easy to break.
const score = 72;
const nestedGrade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : 'F';

// PREFER a small function with guard clauses when there are 3+ branches:
function getGrade(value) {
  if (value >= 90) return 'A';
  if (value >= 75) return 'B';
  if (value >= 60) return 'C';
  return 'F';
}
console.log(nestedGrade, getGrade(score)); // PREDICT #7

// AVOID using a ternary for side effects:  isOk ? save() : retry();
// PREFER if/else for actions; ternaries are for VALUES.

// ----------------------------------------------------------------------------
section('4. switch — use it carefully');
// ----------------------------------------------------------------------------
// The classic trap: forgetting `break` makes execution "fall through".
function badLabel(status) {
  let label = '';
  switch (status) {
    case 'passed':
      label = 'OK';
    // missing break!
    case 'failed':
      label = 'FAIL';
      break;
    default:
      label = 'UNKNOWN';
  }
  return label;
}
console.log(badLabel('passed')); // PREDICT #8

// PREFER: when you use switch, RETURN from each case. No break needed.
function statusLabel(status) {
  switch (status) {
    case 'passed':
      return 'OK';
    case 'failed':
      return 'FAIL';
    case 'skipped':
      return 'SKIP';
    default:
      return 'UNKNOWN';
  }
}
console.log(statusLabel('passed'), statusLabel('weird')); // PREDICT #9

// ----------------------------------------------------------------------------
section('5. Object lookup instead of switch');
// ----------------------------------------------------------------------------
// When each case just MAPS a value to another value, a lookup table is
// shorter, and the data can be reused or exported.
const STATUS_ICONS = {
  passed: '✔',
  failed: '✖',
  skipped: '-',
};

const iconFor = (status) => STATUS_ICONS[status] ?? '?'; // ?? from Lesson 02
console.log(iconFor('passed'), iconFor('failed'), iconFor('weird')); // PREDICT #10

// WATCH OUT when the key comes from outside (API data, tags, user input):
// every object inherits properties like `toString` and `constructor`.
console.log(typeof iconFor('toString')); // PREDICT #11

// PREFER checking that the key is the table's OWN property (Object.hasOwn is
// covered in Lesson 09), or use a Map (Lesson 15):
const safeIconFor = (status) => (Object.hasOwn(STATUS_ICONS, status) ? STATUS_ICONS[status] : '?');
console.log(safeIconFor('passed'), safeIconFor('toString')); // PREDICT #12

// Lookup tables can hold functions too:
const OPERATIONS = {
  add: (a, b) => a + b,
  multiply: (a, b) => a * b,
};
console.log(OPERATIONS.multiply(6, 7)); // PREDICT #13

// Rule of thumb:
//   value -> value mapping        -> lookup object + Object.hasOwn (or a Map, Lesson 15)
//   different LOGIC per case      -> switch with return, or if/else

// ----------------------------------------------------------------------------
section('6. Short-circuiting');
// ----------------------------------------------------------------------------
// && stops at the first FALSY value, || stops at the first TRUTHY value,
// ?? stops at the first value that is not null/undefined.
console.log(true && 'second'); // PREDICT #14
console.log(0 && 'second'); // PREDICT #15
console.log('' || 'fallback'); // PREDICT #16
console.log(0 ?? 'fallback'); // PREDICT #17

// The right side doesn't even run when the left side decides:
let calls = 0;
const count = () => {
  calls += 1;
  return true;
};
false && count();
true || count();
console.log(calls); // PREDICT #18

// AVOID using && as a hidden if for side effects:  isAdmin && deleteAll();
// PREFER:  if (isAdmin) deleteAll();   (clear to every reader)

// ----------------------------------------------------------------------------
section('7. Logical assignment: ??=  ||=  &&=');
// ----------------------------------------------------------------------------
const options = { retries: 0, title: '' };

// ??= assigns only if the current value is null/undefined.
options.retries ??= 3; // keeps 0
options.timeout ??= 30_000; // missing -> assigned
console.log(options.retries, options.timeout); // PREDICT #19

// ||= assigns if the current value is falsy (careful: 0 and '' count!).
options.title ||= 'Untitled';
console.log(options.title); // PREDICT #20

// &&= assigns only if the current value is truthy (transform if present).
const user = { name: '  ada  ' };
user.name &&= user.name.trim();
console.log(`[${user.name}]`); // PREDICT #21

// AVOID: if (options.timeout === undefined) { options.timeout = 30_000; }
// PREFER: options.timeout ??= 30_000;

// ----------------------------------------------------------------------------
section('8. Putting it together');
// ----------------------------------------------------------------------------
// Guard clauses + named booleans + lookup table = flat and readable.
const PRIORITY_BY_TAG = { '@smoke': 'high', '@regression': 'medium' };

function getPriority(test) {
  if (!test) return 'none';
  if (test.skip) return 'none';
  const isCritical = test.title.toLowerCase().includes('payment');
  if (isCritical) return 'critical';
  return Object.hasOwn(PRIORITY_BY_TAG, test.tag) ? PRIORITY_BY_TAG[test.tag] : 'low';
}

console.log(getPriority({ title: 'Payment works', tag: '@regression' })); // PREDICT #22
console.log(getPriority({ title: 'Login works', tag: '@smoke' })); // PREDICT #23
console.log(getPriority({ title: 'Footer links', tag: '@visual' })); // PREDICT #24
console.log(getPriority({ title: 'Old test', skip: true })); // PREDICT #25

console.log('Done. Now open exercises.js and practice from memory!');

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - Name complex conditions with booleans: isFailed && isSlow.
 *    - Guard clauses: handle special cases first, return early, stay flat.
 *    - Ternary for simple VALUES only. Never nest them.
 *    - switch: return from each case. Value-to-value mapping: lookup object
 *      (guard keys from outside with Object.hasOwn).
 *    - && || ?? short-circuit. Don't use them as hidden ifs for actions.
 *    - x ??= default is the modern "set if missing".
 *
 *  In Playwright:
 *    test.skip(browserName === 'webkit', 'Not supported on Safari');  // a guard!
 *    const baseURL = process.env.CI ? CI_URL : LOCAL_URL;            // ternary
 *    // Inside tests, AVOID if/else on UI state (if (await x.isVisible())...):
 *    // it makes tests unpredictable. PREFER web-first assertions:
 *    await expect(page.getByRole('alert')).toHaveText('Saved');
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1  flaky and slow
 *   #2  flaky and slow
 *   #3  0.2 0.2
 *   #4  0 0
 *   #5  Welcome, ada
 *   #6  needs attention
 *   #7  C C
 *   #8  FAIL — bug! The missing break fell through into the 'failed' case
 *   #9  OK UNKNOWN
 *   #10 ✔ ✖ ?
 *   #11 function — not '?'! It found the inherited Object.prototype.toString
 *   #12 ✔ ?
 *   #13 42
 *   #14 second
 *   #15 0 — && returned the first falsy value
 *   #16 fallback
 *   #17 0
 *   #18 0 — count() never ran
 *   #19 0 30000
 *   #20 Untitled
 *   #21 [ada]
 *   #22 critical
 *   #23 high
 *   #24 low
 *   #25 none
 * ============================================================================
 */
