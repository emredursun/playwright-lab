/**
 * Deliberately BUGGY copies of shop.ts, one bug each.
 *
 * Your tests must PASS against the real shop.ts and FAIL against every
 * variant listed for that exercise. Peeking here is allowed, but try first:
 * the bug descriptions are shown when a variant slips through your tests.
 */
import { randomUUID } from 'node:crypto';
import * as shop from './shop.ts';

export type Shop = typeof shop;

export interface Variant {
  readonly bug: string;
  readonly shop: Shop;
}

export const EXERCISES = {
  1: 'Test cartTotal',
  2: 'Test applyDiscount',
  3: 'Test withRetry (async)',
  4: 'Test createTestUser (test data)',
  5: 'Test createIdleTimer with fake time (bonus)',
} as const;

export type ExerciseNumber = keyof typeof EXERCISES;

export const correctShop: Shop = shop;

export const BUGGY_VARIANTS: Readonly<Record<ExerciseNumber, readonly Variant[]>> = {
  1: [
    {
      bug: 'ignores quantity (adds each price once)',
      shop: {
        ...shop,
        cartTotal: (items) => items.reduce((sum, item) => sum + item.priceCents, 0),
      },
    },
    {
      bug: 'crashes on an empty cart (reduce without a start value)',
      shop: {
        ...shop,
        cartTotal: (items) =>
          items.map((item) => item.priceCents * item.quantity).reduce((sum, value) => sum + value),
      },
    },
    {
      bug: 'accepts a negative quantity',
      shop: {
        ...shop,
        cartTotal: (items) => items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),
      },
    },
  ],
  2: [
    {
      bug: 'codes are case-sensitive',
      shop: {
        ...shop,
        applyDiscount: (total, code) =>
          code === 'SAVE10' || code === 'HALF' ? shop.applyDiscount(total, code) : fail(code),
      },
    },
    {
      bug: 'an unknown code silently returns the full price',
      shop: {
        ...shop,
        applyDiscount: (total, code) =>
          ['SAVE10', 'HALF'].includes(code.trim().toUpperCase())
            ? shop.applyDiscount(total, code)
            : total,
      },
    },
    {
      bug: 'rounds down instead of to the nearest cent',
      shop: {
        ...shop,
        applyDiscount: (total, code) => {
          const percent =
            code.trim().toUpperCase() === 'HALF'
              ? 50
              : code.trim().toUpperCase() === 'SAVE10'
                ? 10
                : fail(code);
          return Math.floor((total * (100 - percent)) / 100);
        },
      },
    },
  ],
  3: [
    {
      bug: 'never retries (calls the action only once)',
      shop: { ...shop, withRetry: (action) => action() },
    },
    {
      bug: 'calls the action one time too many',
      shop: {
        ...shop,
        withRetry: (action, { attempts }) => shop.withRetry(action, { attempts: attempts + 1 }),
      },
    },
    {
      bug: 'rejects with the FIRST error instead of the last one',
      shop: {
        ...shop,
        withRetry: async (action, { attempts }) => {
          let firstError: unknown;
          for (let attempt = 1; attempt <= attempts; attempt += 1) {
            try {
              return await action();
            } catch (error) {
              firstError ??= error;
            }
          }
          throw firstError;
        },
      },
    },
  ],
  4: [
    {
      bug: 'every user gets the same email address',
      shop: {
        ...shop,
        createTestUser: (overrides = {}) => ({
          id: randomUUID(),
          email: 'test.user@example.test',
          name: 'Test User',
          role: 'member',
          ...overrides,
        }),
      },
    },
    {
      bug: 'defaults overwrite the overrides (wrong spread order)',
      shop: {
        ...shop,
        createTestUser: (overrides = {}) => {
          const id = randomUUID();
          return {
            ...overrides,
            id,
            email: `user.${id}@example.test`,
            name: 'Test User',
            role: 'member',
          };
        },
      },
    },
  ],
  5: [
    {
      bug: 'touch() does not restart the countdown',
      shop: {
        ...shop,
        createIdleTimer: (onIdle, idleMs) => {
          const timer = setTimeout(onIdle, idleMs);
          return { touch() {}, stop: () => clearTimeout(timer) };
        },
      },
    },
    {
      bug: 'fires repeatedly (setInterval instead of setTimeout)',
      shop: {
        ...shop,
        createIdleTimer: (onIdle, idleMs) => {
          let timer = setInterval(onIdle, idleMs);
          return {
            touch() {
              clearInterval(timer);
              timer = setInterval(onIdle, idleMs);
            },
            stop: () => clearInterval(timer),
          };
        },
      },
    },
    {
      bug: 'stop() does not cancel the timer',
      shop: {
        ...shop,
        createIdleTimer: (onIdle, idleMs) => {
          const real = shop.createIdleTimer(onIdle, idleMs);
          return { touch: () => real.touch(), stop() {} };
        },
      },
    },
  ],
};

function fail(code: string): never {
  throw new Error(`Unknown discount code: ${code}`);
}
