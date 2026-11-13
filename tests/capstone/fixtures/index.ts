/**
 * Custom fixtures for the capstone suite.
 *
 * Specs import `test` and `expect` from HERE, not from '@playwright/test':
 *   import { test, expect } from '../fixtures';
 *
 * Fixtures replace hand-written beforeEach setup. Each test asks only for
 * what it needs, and Playwright builds it fresh for that test (isolation),
 * tears it down afterwards, and types it automatically.
 */
import { test as base, expect } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';
import { createCustomer, type Customer } from '../data/factories';
import { USERS, type Credentials } from '../data/users';

/** Test-scoped fixtures: created again for every test. */
interface CapstoneFixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  /** A unique customer for checkout forms, different in every test. */
  customer: Customer;
}

/**
 * Option fixtures: values with a default that a project in
 * playwright.config.ts, or a single file via `test.use({...})`, can override.
 */
export interface CapstoneOptions {
  credentials: Credentials;
}

/** Worker-scoped fixtures: created once per worker process, then shared. */
interface CapstoneWorkerFixtures {
  /** Identifies the worker, e.g. in generated test data or logs. */
  workerTag: string;
}

export const test = base.extend<CapstoneFixtures & CapstoneOptions, CapstoneWorkerFixtures>({
  // [defaultValue, { option: true }] marks an option fixture.
  credentials: [USERS.standard, { option: true }],

  // Playwright requires an object pattern as the first argument even when the
  // fixture needs no other fixtures, hence the empty `{}`.
  workerTag: [
    async ({}, use, workerInfo) => {
      await use(`worker-${String(workerInfo.workerIndex)}`);
    },
    { scope: 'worker' },
  ],

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  customer: async ({ workerTag }, use) => {
    // Fixtures can depend on other fixtures, even worker-scoped ones.
    await use(createCustomer({ firstName: `Ada-${workerTag}` }));
  },
});

export { expect };
