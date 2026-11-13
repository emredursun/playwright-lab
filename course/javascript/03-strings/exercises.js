/**
 * ============================================================================
 *  EXERCISES 03 — Strings
 * ============================================================================
 *  Run:  node course/javascript/03-strings/exercises.js
 *
 *  How to work:
 *    1. Replace each `throw new Error('TODO')` with your solution.
 *    2. Run the file. Every test must pass (✔). Failing tests show what's wrong.
 *    3. Answer the self-check and review questions in your head or on paper.
 *    4. Only THEN compare with solutions.js.
 *
 *  Struggling a bit is good: it's how memory is built. Give each exercise at
 *  least 10 minutes before you peek.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// ----------------------------------------------------------------------------
// Exercise 1 — Refactor to a template literal
// This works, but uses + concatenation. Rewrite it with a template literal.
// The tests protect the behavior.
// ----------------------------------------------------------------------------
function formatResult(testName, durationMs, passed) {
  return '[' + (passed ? 'PASS' : 'FAIL') + '] ' + testName + ' (' + durationMs + ' ms)';
}

// ----------------------------------------------------------------------------
// Exercise 2 — Slugify
// Turn a test title into a URL/file-friendly slug: trim it, lowercase it and
// replace every group of spaces with a single '-'.
// Example: '  User Can   Log In ' -> 'user-can-log-in'
// Hint: split(' ') + filter, or a small regex like /\s+/.
// ----------------------------------------------------------------------------
function slugify(title) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 3 — Parse tags
// Input: a comma-separated string like ' @smoke,@login , ,@smoke '.
// Return the unique tags, trimmed, without empty entries, in their original
// order: ['@smoke', '@login'].
// Hint: a Set removes duplicates while keeping insertion order (Set is taught
// in Lesson 15; here you only need [...new Set(array)]). .filter() keeps the
// items for which a function returns true (Lesson 08).
// ----------------------------------------------------------------------------
function parseTags(text) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 4 — An exact URL pattern from a variable
// Return a RegExp that matches a full URL only when it ENDS with exactly the
// given path (query string included).
//   pathPattern('/products/42?sort=price')
//     matches     'https://shop.test/products/42?sort=price'
//     not matches 'https://shop.test/products/42?sort=price-desc'
//     not matches 'https://shop.test/products/42Xsort=price'   (the ? is literal!)
// Hint: lesson section 8: escape the variable, then anchor the end with $.
// ----------------------------------------------------------------------------
function pathPattern(path) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 5 (bonus) — Parse a log line with named groups
// Input:  '2026-11-13 ERROR [checkout] Payment failed'
// Return: { date: '2026-11-13', level: 'ERROR', area: 'checkout', message: 'Payment failed' }
// Return null when the line doesn't match (Lesson 02).
// Heads-up: match.groups is a special object with a NULL prototype, so the
// strict deepEqual in the test rejects it. Return a normal copy: { ...match.groups }.
// ----------------------------------------------------------------------------
function parseLogLine(line) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.js)
//   Q1. Spot the bug:  const name = input.trim; if (name === '') { ... }
//       and this one:  input.trim(); return input.length;
//   Q2. What is the difference between replace and replaceAll?
//   Q3. A test asserts await expect(page).toHaveURL(/cart/) and passes on the
//       '/cart-error' page. Why, and how do you fix the pattern?
//   Q4. Why is ['b', 'B', 'a'].sort() a bad way to check that a UI list of
//       names is sorted?
//   Q5. You build new RegExp(productName) and the test fails for 'Shoes (Kids)'.
//       Why, and what's the fix?
//
// Review (earlier lessons)
//   R1. (Lesson 01) Why is `const` the right default even for an array that
//       you push items into?
//   R2. (Lesson 02) options.title || 'Untitled' vs options.title ?? 'Untitled':
//       which one keeps an empty title, and when would you want that?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
const sourceOf = (fn) => fn.toString().replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');

test('1. formatResult: template literal, same output', () => {
  assert.equal(formatResult('login works', 120, true), '[PASS] login works (120 ms)');
  assert.equal(formatResult('checkout', 9_000, false), '[FAIL] checkout (9000 ms)');
  assert.doesNotMatch(
    sourceOf(formatResult),
    /['"]\s*\+|\+\s*['"]/,
    'replace + concatenation with a template literal',
  );
});

test('2. slugify: trimmed, lowercase, single dashes', () => {
  assert.equal(slugify('  User Can   Log In '), 'user-can-log-in');
  assert.equal(slugify('Checkout'), 'checkout');
});

test('3. parseTags: trimmed, unique, no empties, original order', () => {
  assert.deepEqual(parseTags(' @smoke,@login , ,@smoke '), ['@smoke', '@login']);
  assert.deepEqual(parseTags(''), []);
});

test('4. pathPattern: escaped and anchored', () => {
  const pattern = pathPattern('/products/42?sort=price');
  assert.ok(pattern instanceof RegExp, 'return a RegExp');
  assert.ok(pattern.test('https://shop.test/products/42?sort=price'));
  assert.ok(
    !pattern.test('https://shop.test/products/42?sort=price-desc'),
    'anchor the end with $',
  );
  assert.ok(
    !pattern.test('https://shop.test/products/42Xsort=price'),
    'escape special characters like ?',
  );
  assert.ok(pathPattern('/a.b').test('https://x.test/a.b'));
  assert.ok(!pathPattern('/a.b').test('https://x.test/aXb'), 'escape the dot');
});

test('5. parseLogLine (bonus): named groups', () => {
  assert.deepEqual(parseLogLine('2026-11-13 ERROR [checkout] Payment failed'), {
    date: '2026-11-13',
    level: 'ERROR',
    area: 'checkout',
    message: 'Payment failed',
  });
  assert.equal(parseLogLine('not a log line'), null);
});
