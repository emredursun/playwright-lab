/**
 * ============================================================================
 *  SOLUTIONS 21 — Testing Fundamentals
 * ============================================================================
 *  Run:  node course/applied/21-testing-fundamentals/solutions.ts
 *
 *  These are reference test suites. Yours can look different: what matters
 *  is that they pass on shop.ts and catch every buggy variant. Read the WHY
 *  comments to see what makes a test strong.
 * ============================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSuites } from './harness.ts';
import type { Shop } from './variants.ts';

// Exercise 1
// WHY: one behavior per test, each named as a sentence. The data uses two
// items with quantity > 1, so a bug that ignores quantity changes the result.
// "Empty" and "invalid" are the edge cases that real bugs hide in.
function cartTotalTests({ cartTotal }: Shop): void {
  test('adds price × quantity for every item', () => {
    // Arrange
    const items = [
      { name: 'Book', priceCents: 1_250, quantity: 2 },
      { name: 'Pen', priceCents: 199, quantity: 3 },
    ];
    // Act
    const total = cartTotal(items);
    // Assert
    assert.equal(total, 3_097);
  });

  test('an empty cart costs 0', () => {
    assert.equal(cartTotal([]), 0);
  });

  test('a negative quantity throws a RangeError that names the item', () => {
    assert.throws(() => cartTotal([{ name: 'Pen', priceCents: 199, quantity: -1 }]), {
      name: 'RangeError',
      message: /Pen/,
    });
  });

  test('a fractional quantity throws a RangeError', () => {
    assert.throws(() => cartTotal([{ name: 'Pen', priceCents: 199, quantity: 1.5 }]), RangeError);
  });
}

// Exercise 2
// WHY: 995 is chosen on purpose: 995 × 0.9 = 895.5, where "nearest" (896)
// and "round down" (895) give different answers. Picking inputs that tell
// right and wrong implementations apart is the core skill of test design.
function applyDiscountTests({ applyDiscount }: Shop): void {
  test('SAVE10 takes 10% off', () => {
    assert.equal(applyDiscount(1_000, 'SAVE10'), 900);
  });

  test('HALF takes 50% off', () => {
    assert.equal(applyDiscount(1_000, 'HALF'), 500);
  });

  test('codes are case-insensitive and ignore surrounding spaces', () => {
    assert.equal(applyDiscount(1_000, '  save10 '), 900);
  });

  test('rounds to the nearest cent', () => {
    assert.equal(applyDiscount(995, 'SAVE10'), 896);
  });

  test('an unknown code throws instead of silently charging full price', () => {
    assert.throws(() => applyDiscount(1_000, 'FREE'), /Unknown discount code/);
  });
}

// Exercise 3
// WHY: a mock.fn spy counts calls, so "how many times" becomes an exact
// assertion. assert.rejects with an object checks WHICH error came back.
// Each attempt throws a different message, so "first vs last" is visible.
function withRetryTests({ withRetry }: Shop): void {
  test('resolves with the result and does not retry after a success', async (t) => {
    const action = t.mock.fn(async () => 'ok');

    assert.equal(await withRetry(action, { attempts: 3 }), 'ok');
    assert.equal(action.mock.callCount(), 1);
  });

  test('retries until the action succeeds', async (t) => {
    let calls = 0;
    const action = t.mock.fn(async () => {
      calls += 1;
      if (calls < 3) throw new Error(`attempt ${calls} failed`);
      return 'ok';
    });

    assert.equal(await withRetry(action, { attempts: 3 }), 'ok');
    assert.equal(action.mock.callCount(), 3);
  });

  test('calls exactly `attempts` times, then rejects with the LAST error', async (t) => {
    let calls = 0;
    const action = t.mock.fn(async () => {
      calls += 1;
      throw new Error(`attempt ${calls} failed`);
    });

    await assert.rejects(withRetry(action, { attempts: 3 }), { message: 'attempt 3 failed' });
    assert.equal(action.mock.callCount(), 3);
  });
}

// Exercise 4
// WHY: test data factories exist so parallel tests never collide. Testing
// "two users are different" proves uniqueness; testing an override of a
// default field proves the spread order.
function createTestUserTests({ createTestUser }: Shop): void {
  test('creates a member with an email by default', () => {
    const user = createTestUser();

    assert.equal(user.role, 'member');
    assert.match(user.email, /^\S+@\S+$/);
  });

  test('every user gets a unique id and email', () => {
    const first = createTestUser();
    const second = createTestUser();

    assert.notEqual(first.id, second.id);
    assert.notEqual(first.email, second.email);
  });

  test('overrides win over the defaults', () => {
    const admin = createTestUser({ role: 'admin', email: 'admin@example.test' });

    assert.equal(admin.role, 'admin');
    assert.equal(admin.email, 'admin@example.test');
  });
}

// Exercise 5
// WHY: fake time makes a 1-second timer test run in microseconds and makes
// it deterministic: tick(999) vs tick(1) checks the exact boundary.
// t.mock.timers is reset automatically when each test ends.
function idleTimerTests({ createIdleTimer }: Shop): void {
  test('calls onIdle once after idleMs without activity', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
    const onIdle = t.mock.fn();

    createIdleTimer(onIdle, 1_000);
    t.mock.timers.tick(999);
    assert.equal(onIdle.mock.callCount(), 0);
    t.mock.timers.tick(1);
    assert.equal(onIdle.mock.callCount(), 1);
    t.mock.timers.tick(5_000);
    assert.equal(onIdle.mock.callCount(), 1, 'must fire only once');
  });

  test('touch() restarts the countdown', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
    const onIdle = t.mock.fn();
    const timer = createIdleTimer(onIdle, 1_000);

    t.mock.timers.tick(800);
    timer.touch();
    t.mock.timers.tick(800);
    assert.equal(onIdle.mock.callCount(), 0);
    t.mock.timers.tick(200);
    assert.equal(onIdle.mock.callCount(), 1);
  });

  test('stop() cancels the timer', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
    const onIdle = t.mock.fn();
    const timer = createIdleTimer(onIdle, 1_000);

    timer.stop();
    t.mock.timers.tick(5_000);
    assert.equal(onIdle.mock.callCount(), 0);
  });
}

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. Nothing yet: a test only proves something once you have seen it
//       FAIL for the right reason. Break the code (or the expected value) on
//       purpose and watch the test go red. The checker does exactly that.
//   Q2. They share state: test B depends on what test A left behind. Run
//       alone, in another order or in parallel (Playwright's fullyParallel),
//       B breaks. Create fresh data in each test or in beforeEach.
//   Q3. The fixed email collides when tests run in parallel or are re-run
//       against the same backend. Generate unique data (crypto.randomUUID(),
//       or testInfo.workerIndex in Playwright) and keep only the fields the
//       test asserts on fixed.
//   Q4. A spy (mock.fn) records calls to check HOW something was called. A
//       stub returns canned answers so the code under test can run. A fake
//       is a small working implementation (an in-memory repository).
//   Q5. It turns off every other test in the file, so CI would go green
//       while running almost nothing. node:test needs --test-only to honor
//       it; Playwright's `forbidOnly: !!process.env.CI` fails the run.
//
// Review answers
//   R1. (Lesson 13) With forEach the callbacks are fired and forgotten: the
//       test finishes before they settle, so failures are lost. Use
//       for...of with await, or await Promise.all(items.map(...)).
//   R2. (Lesson 12) assert.rejects(promise, { message: '...' }) or
//       assert.rejects(promise, SomeErrorClass). A try/catch without a
//       "should have thrown" assert passes when nothing throws.
//   R3. (Lesson 18) It must narrow `unknown` with real runtime checks
//       (typeof, in, Array.isArray). `as User` only silences the compiler.
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
checkSuites(import.meta.filename, {
  1: cartTotalTests,
  2: applyDiscountTests,
  3: withRetryTests,
  4: createTestUserTests,
  5: idleTimerTests,
});
