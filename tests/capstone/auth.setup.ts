/**
 * Authentication setup. Runs ONCE, before the browser projects, because they
 * declare `dependencies: ['setup']` in playwright.config.ts.
 *
 * It logs in through the UI a single time and saves the cookies and local
 * storage to AUTH_FILE. Every test in the browser projects then starts
 * already logged in, which is faster and keeps login steps out of tests that
 * are about something else.
 */
import { AUTH_FILE } from './auth-state';
import { test as setup, expect } from './fixtures';

setup('log in and save the session', async ({ page, loginPage, inventoryPage, credentials }) => {
  await loginPage.goto();
  await loginPage.login(credentials);

  // Wait for proof that login worked BEFORE saving the state.
  await expect(inventoryPage.title).toHaveText('Products');

  await page.context().storageState({ path: AUTH_FILE });
});
