/**
 * Test data factories: build valid data with sensible defaults and let each
 * test override only what it cares about (Lesson 19: Partial<T>).
 *
 * Defaults are UNIQUE on every call. With `fullyParallel: true`, tests that
 * create data with fixed values collide on real systems sooner or later.
 */
import { randomUUID } from 'node:crypto';

export interface Customer {
  readonly firstName: string;
  readonly lastName: string;
  readonly postalCode: string;
}

export function createCustomer(overrides: Partial<Customer> = {}): Customer {
  const suffix = randomUUID().slice(0, 8);
  return {
    firstName: 'Ada',
    lastName: `Tester-${suffix}`,
    postalCode: '1011 AB',
    ...overrides,
  };
}
