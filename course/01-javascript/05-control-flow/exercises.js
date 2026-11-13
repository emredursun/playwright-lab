/**
 * ============================================================================
 *  EXERCISES 05 — Control Flow
 * ============================================================================
 *  Run:  node course/01-javascript/05-control-flow/exercises.js
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
// Exercise 1 — Flatten with guard clauses
// This works, but is deeply nested. Rewrite it with guard clauses so that no
// `else` is left. The tests protect the behavior.
// ----------------------------------------------------------------------------
function canCheckout(cart) {
  if (cart) {
    if (cart.items.length > 0) {
      if (cart.isPaymentValid) {
        return 'ok';
      } else {
        return 'invalid payment';
      }
    } else {
      return 'empty cart';
    }
  } else {
    return 'no cart';
  }
}

// ----------------------------------------------------------------------------
// Exercise 2 — Lookup table instead of switch
// Return the HTTP status text for a code: 200 'OK', 201 'Created',
// 404 'Not Found', 500 'Internal Server Error'. Unknown codes -> 'Unknown'.
// Rule: use an object lookup, no switch and no if/else chain.
// Careful: the code may come from outside, so statusText('constructor') must
// also return 'Unknown' (lesson section 5).
// ----------------------------------------------------------------------------
function statusText(code) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 3 — Fill in defaults with logical assignment
// Return a NEW options object (never mutate the caller's object: Lesson 01)
// so that:
//   - retries defaults to 2 (but an explicit 0 is kept)
//   - browser defaults to 'chromium'
//   - name is trimmed only if it exists
// Rule: copy first, then use ??= and &&= on the copy. No if statements.
// ----------------------------------------------------------------------------
function applyDefaults(options) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 4 — Classify a test run
// Return:
//   'invalid' if durationMs is not a finite number (Lesson 04!)
//   'failed'  if passed is false
//   'slow'    if durationMs > 3000
//   'passed'  otherwise
// Use guard clauses, in that order.
// ----------------------------------------------------------------------------
function classifyRun(run) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 5 (bonus) — Retry decision
// Return true if a failed test should be retried:
//   - only when status is 'failed'
//   - only when attempt < maxAttempts (maxAttempts defaults to 3 if missing)
//   - never when the error message includes 'AssertionError' (real bug, not
//     flakiness) — `error` may be missing!
// Name each condition with a const before combining them.
// ----------------------------------------------------------------------------
function shouldRetry(result) {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.js)
//   Q1. What is a guard clause, and what problem does it solve?
//   Q2. What happens in a switch when you forget `break`?
//   Q3. Spot the bug:  const label = LABELS[apiResponse.type] ?? 'Other';
//       It works in every test, then shows "function Object() { [native code] }"
//       in production. Which value of `type` caused it, and what's the fix?
//   Q4. What is the difference between x ||= 5 and x ??= 5?
//   Q5. A test does:  if (await banner.isVisible()) await banner.close();
//       Why is this risky in Playwright, and what would you do instead?
//
// Review (earlier lessons)
//   R1. (Lesson 01) Why does mutating a caller's `options` object cause bugs
//       that are hard to find?
//   R2. (Lesson 03) Why should /\/checkout$/ be preferred over /checkout/ in
//       toHaveURL?
//   R3. (Lesson 04) Number('') returns what, and why does it matter for form
//       input?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
const sourceOf = (fn) => fn.toString().replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');

test('1. canCheckout: flat code, same behavior', () => {
  assert.equal(canCheckout(null), 'no cart');
  assert.equal(canCheckout({ items: [], isPaymentValid: true }), 'empty cart');
  assert.equal(canCheckout({ items: [1], isPaymentValid: false }), 'invalid payment');
  assert.equal(canCheckout({ items: [1], isPaymentValid: true }), 'ok');
  assert.doesNotMatch(sourceOf(canCheckout), /\belse\b/, 'remove every `else` with guard clauses');
});

test('2. statusText: object lookup with a fallback', () => {
  assert.equal(statusText(200), 'OK');
  assert.equal(statusText(201), 'Created');
  assert.equal(statusText(404), 'Not Found');
  assert.equal(statusText(500), 'Internal Server Error');
  assert.equal(statusText(418), 'Unknown');
  assert.equal(statusText('constructor'), 'Unknown', 'inherited keys must not leak out');
  assert.doesNotMatch(sourceOf(statusText), /\b(switch|if)\b/, 'use a lookup object');
});

test('3. applyDefaults: logical assignment on a copy', () => {
  assert.deepEqual(applyDefaults({}), { retries: 2, browser: 'chromium' });
  const input = Object.freeze({ retries: 0, browser: 'firefox', name: '  smoke ' });
  const result = applyDefaults(input);
  assert.deepEqual(result, { retries: 0, browser: 'firefox', name: 'smoke' });
  assert.notEqual(result, input, 'return a NEW object');
  assert.equal(input.name, '  smoke ', 'the input must stay untouched');
  assert.doesNotMatch(sourceOf(applyDefaults), /\bif\b/, 'use ??= and &&= instead of if');
});

test('4. classifyRun: guard clauses in order', () => {
  assert.equal(classifyRun({ passed: true, durationMs: Number.NaN }), 'invalid');
  assert.equal(classifyRun({ passed: true, durationMs: '100' }), 'invalid');
  assert.equal(classifyRun({ passed: false, durationMs: 9_000 }), 'failed');
  assert.equal(classifyRun({ passed: true, durationMs: 3_001 }), 'slow');
  assert.equal(classifyRun({ passed: true, durationMs: 3_000 }), 'passed');
});

test('5. shouldRetry (bonus): combined named conditions', () => {
  assert.equal(shouldRetry({ status: 'passed', attempt: 1 }), false);
  assert.equal(shouldRetry({ status: 'failed', attempt: 1 }), true);
  assert.equal(shouldRetry({ status: 'failed', attempt: 3 }), false);
  assert.equal(shouldRetry({ status: 'failed', attempt: 3, maxAttempts: 5 }), true);
  assert.equal(
    shouldRetry({ status: 'failed', attempt: 1, error: { message: 'AssertionError: expected 2' } }),
    false,
  );
  assert.equal(
    shouldRetry({ status: 'failed', attempt: 1, error: { message: 'Timeout 30000ms exceeded' } }),
    true,
  );
});
