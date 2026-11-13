/**
 * ============================================================================
 *  SOLUTIONS 03 — Strings
 * ============================================================================
 *  Run:  node course/01-javascript/03-strings/solutions.js
 *
 *  Compare these with YOUR solutions. If yours is different but the tests pass,
 *  it may be just as good. Read the WHY comments to see the trade-offs.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// Exercise 1
// WHY: the template literal shows the final shape of the text at a glance.
// The status is computed first with a const (Lesson 01) to keep the template
// short.
function formatResult(testName, durationMs, passed) {
  const status = passed ? 'PASS' : 'FAIL';
  return `[${status}] ${testName} (${durationMs} ms)`;
}

// Exercise 2
// WHY: trim first, then split on "one or more whitespace characters" so that
// several spaces in a row still give one dash.
function slugify(title) {
  return title.trim().toLowerCase().split(/\s+/).join('-');
}

// Exercise 3
// WHY: split -> trim -> drop empties is a clear pipeline. A Set removes
// duplicates and keeps the first-seen order; spread turns it back into an
// array.
function parseTags(text) {
  const tags = text
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag !== '');
  return [...new Set(tags)];
}

// Exercise 4
// WHY: a path from a variable can contain regex characters (. ? + ( ) ...).
// Escaping makes every character literal, and the $ anchor stops longer URLs
// from matching. Without the anchor, '/products/42?sort=price-desc' would pass.
// No ^ anchor here on purpose: the protocol and host may vary.
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

function pathPattern(path) {
  return new RegExp(`${escapeRegExp(path)}$`);
}

// Exercise 5
// WHY: named groups give the result object its keys directly. match.groups
// has a null prototype, so we spread it into a normal object. When the line
// doesn't match, `match` is null and we return null explicitly.
const LOG_LINE_PATTERN =
  /^(?<date>\d{4}-\d{2}-\d{2}) (?<level>[A-Z]+) \[(?<area>[^\]]+)\] (?<message>.+)$/;

function parseLogLine(line) {
  const match = line.match(LOG_LINE_PATTERN);
  return match ? { ...match.groups } : null;
}

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. `input.trim` without () is the FUNCTION itself, never equal to ''.
//       In the second snippet the trimmed result is thrown away: strings are
//       immutable, so input.length still counts the spaces. Store the result:
//       const trimmed = input.trim();
//   Q2. replace changes only the first match (unless you pass a regex with
//       the g flag). replaceAll changes every match.
//   Q3. An unanchored /cart/ matches 'cart' ANYWHERE, including '/cart-error'.
//       Anchor it: /\/cart$/ (or match the full path).
//   Q4. Default sort compares character codes: 'B' < 'a' < 'b', and accented
//       letters land at the end. A UI sorted "like a human" would fail the
//       check (or pass by luck). Compare against
//       names.toSorted((a, b) => a.localeCompare(b)).
//   Q5. ( and ) are regex syntax: 'Shoes (Kids)' becomes a group and the
//       pattern looks for 'Shoes Kids'. Escape the variable first:
//       new RegExp(escapeRegExp(productName)).
//
// Review answers
//   R1. `const` stops REASSIGNMENT, not mutation. The label always points at
//       the same array, which is exactly what you want; push still works.
//   R2. ?? keeps '' (it only falls back for null/undefined); || replaces it.
//       Keep it when "empty" is a valid user choice, e.g. clearing a field.
// ----------------------------------------------------------------------------

// ============================== TESTS ======================================
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
