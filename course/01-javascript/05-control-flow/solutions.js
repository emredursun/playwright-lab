/**
 * ============================================================================
 *  SOLUTIONS 05 — Control Flow
 * ============================================================================
 *  Run:  node course/01-javascript/05-control-flow/solutions.js
 *
 *  Compare these with YOUR solutions. If yours is different but the tests pass,
 *  it may be just as good. Read the WHY comments to see the trade-offs.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// Exercise 1
// WHY: each guard handles one failure case and leaves. After the guards, the
// only remaining case is the happy path — no nesting, no else.
function canCheckout(cart) {
  if (!cart) return 'no cart';
  if (cart.items.length === 0) return 'empty cart';
  if (!cart.isPaymentValid) return 'invalid payment';
  return 'ok';
}

// Exercise 2
// WHY: a pure value-to-value mapping is DATA, so store it as data. Number keys
// become string keys, and STATUS_TEXT[404] still works. Object.hasOwn makes
// sure inherited names like 'constructor' fall back to 'Unknown' instead of
// returning a function. A Map (Lesson 15) avoids the problem entirely.
const STATUS_TEXT = {
  200: 'OK',
  201: 'Created',
  404: 'Not Found',
  500: 'Internal Server Error',
};

function statusText(code) {
  return Object.hasOwn(STATUS_TEXT, code) ? STATUS_TEXT[code] : 'Unknown';
}

// Exercise 3
// WHY: copy first with spread, so the caller's object is never touched (a
// mutated shared options object is a classic framework bug). ??= only fills
// null/undefined, so retries: 0 survives (||= would replace it). &&=
// transforms `name` only when it exists, so no `name: undefined` key appears.
function applyDefaults(options) {
  const result = { ...options };
  result.retries ??= 2;
  result.browser ??= 'chromium';
  result.name &&= result.name.trim();
  return result;
}

// Exercise 4
// WHY: the order of guards IS the logic. The validity check comes first, so
// later checks can trust durationMs. Number.isFinite also rejects strings.
const SLOW_THRESHOLD_MS = 3_000;

function classifyRun(run) {
  if (!Number.isFinite(run.durationMs)) return 'invalid';
  if (!run.passed) return 'failed';
  if (run.durationMs > SLOW_THRESHOLD_MS) return 'slow';
  return 'passed';
}

// Exercise 5
// WHY: three named booleans turn the final line into a readable sentence.
// ?. and ?? (Lesson 02) handle the missing `error` and `maxAttempts`.
function shouldRetry(result) {
  const isFailed = result.status === 'failed';
  const hasAttemptsLeft = result.attempt < (result.maxAttempts ?? 3);
  const isRealBug = result.error?.message?.includes('AssertionError') ?? false;
  return isFailed && hasAttemptsLeft && !isRealBug;
}

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. An early `return` (or `throw`) for a special case at the top of a
//       function. It removes nesting, so the main logic stays flat and easy
//       to read.
//   Q2. Execution "falls through" into the next case and runs its code too.
//       Return from each case (or always add break) to avoid it.
//   Q3. type === 'constructor' (or 'toString', ...): plain objects inherit
//       those properties, so the lookup returned a function instead of
//       undefined and ?? never kicked in. Fix:
//       Object.hasOwn(LABELS, type) ? LABELS[type] : 'Other', or use a Map.
//   Q4. ||= assigns when x is ANY falsy value (0, '', false...). ??= assigns
//       only when x is null or undefined.
//   Q5. isVisible() checks ONCE, right now, without waiting. If the banner
//       appears 100 ms later, the test skips the close and fails later (or
//       passes only sometimes). Make the state deterministic instead (e.g. set
//       the consent cookie before the test), or register a handler for it with
//       page.addLocatorHandler(). Tests should not branch on UI state.
//
// Review answers
//   R1. Every other piece of code holding the same object sees the change,
//       far away from where it happened. Tests then depend on the order they
//       run in. Return a new object instead.
//   R2. An unanchored /checkout/ also matches '/checkout-failed' or
//       '/checkout/error', so a broken flow can pass. The $ anchor demands
//       the exact end of the URL.
//   R3. 0, not NaN. An empty field silently becomes 0 and passes
//       Number.isNaN checks. Check for an empty (trimmed) string first.
// ----------------------------------------------------------------------------

// ============================== TESTS ======================================
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
