/**
 * The module under test for Lesson 21.
 *
 * These functions are CORRECT. Your job in exercises.ts is to write tests
 * that pin down their behavior so precisely that every buggy copy in
 * variants.ts is caught.
 */
import { randomUUID } from 'node:crypto';

// ---------------------------------------------------------------------------
// Exercise 1: cartTotal
// ---------------------------------------------------------------------------
export interface CartItem {
  readonly name: string;
  readonly priceCents: number;
  readonly quantity: number;
}

/** Sum of priceCents × quantity. Throws a RangeError for an invalid quantity. */
export function cartTotal(items: readonly CartItem[]): number {
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 0) {
      throw new RangeError(`Invalid quantity for ${item.name}: ${item.quantity}`);
    }
  }
  return items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
}

// ---------------------------------------------------------------------------
// Exercise 2: applyDiscount
// ---------------------------------------------------------------------------
const DISCOUNT_PERCENT = { SAVE10: 10, HALF: 50 } as const;
type DiscountCode = keyof typeof DISCOUNT_PERCENT;

const isDiscountCode = (code: string): code is DiscountCode =>
  Object.hasOwn(DISCOUNT_PERCENT, code);

/**
 * Applies a discount code to a total in cents, rounded to the nearest cent.
 * Codes are case-insensitive and surrounding spaces are ignored.
 * An unknown code throws an Error whose message contains "Unknown discount code".
 */
export function applyDiscount(totalCents: number, code: string): number {
  const normalized = code.trim().toUpperCase();
  if (!isDiscountCode(normalized)) {
    throw new Error(`Unknown discount code: ${code}`);
  }
  return Math.round((totalCents * (100 - DISCOUNT_PERCENT[normalized])) / 100);
}

// ---------------------------------------------------------------------------
// Exercise 3: withRetry
// ---------------------------------------------------------------------------
export interface RetryOptions {
  readonly attempts: number;
}

/**
 * Calls `action` up to `attempts` times. Resolves with the first success.
 * If every attempt fails, rejects with the error from the LAST attempt.
 */
export async function withRetry<T>(
  action: () => Promise<T>,
  { attempts }: RetryOptions,
): Promise<T> {
  if (!Number.isInteger(attempts) || attempts < 1) {
    throw new RangeError(`attempts must be a positive integer, got ${attempts}`);
  }
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

// ---------------------------------------------------------------------------
// Exercise 4: createTestUser
// ---------------------------------------------------------------------------
export interface TestUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: 'admin' | 'member';
}

/** Builds a unique test user. Every field can be overridden. */
export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  const id = randomUUID();
  return { id, email: `user.${id}@example.test`, name: 'Test User', role: 'member', ...overrides };
}

// ---------------------------------------------------------------------------
// Exercise 5 (bonus): createIdleTimer
// ---------------------------------------------------------------------------
export interface IdleTimer {
  /** Activity happened: restart the countdown. */
  touch(): void;
  /** Cancel the timer for good. */
  stop(): void;
}

/** Calls `onIdle` ONCE after `idleMs` without activity. */
export function createIdleTimer(onIdle: () => void, idleMs: number): IdleTimer {
  let timer: ReturnType<typeof setTimeout> | undefined = setTimeout(onIdle, idleMs);
  return {
    touch() {
      clearTimeout(timer);
      timer = setTimeout(onIdle, idleMs);
    },
    stop() {
      clearTimeout(timer);
      timer = undefined;
    },
  };
}
