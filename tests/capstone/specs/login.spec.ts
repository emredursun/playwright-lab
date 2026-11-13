import { LOGGED_OUT } from '../auth-state';
import { USERS } from '../data/users';
import { test, expect } from '../fixtures';

// The browser projects start logged in (see auth.setup.ts). Login tests must
// start logged OUT, so this file overrides the saved state.
test.use({ storageState: LOGGED_OUT });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test(
    'a standard user lands on the product list',
    { tag: '@smoke' },
    async ({ page, loginPage, inventoryPage }) => {
      await loginPage.login(USERS.standard);

      await expect(page).toHaveURL(/\/inventory\.html$/);
      await expect(inventoryPage.title).toHaveText('Products');
    },
  );

  test('a locked-out user sees why they cannot log in', async ({ loginPage }) => {
    await loginPage.login(USERS.lockedOut);

    await expect(loginPage.errorMessage).toHaveText(/this user has been locked out/);
  });

  // Data-driven tests: one test per case, generated at collection time.
  // Each case gets its own name, so a failure report says exactly which one broke.
  const missingFieldCases = [
    {
      title: 'username is required',
      username: '',
      password: 'secret_sauce',
      error: 'Username is required',
    },
    {
      title: 'password is required',
      username: 'standard_user',
      password: '',
      error: 'Password is required',
    },
  ] as const;

  for (const { title, username, password, error } of missingFieldCases) {
    test(`validation: ${title}`, async ({ loginPage }) => {
      await loginPage.login({ username, password });

      await expect(loginPage.errorMessage).toContainText(error);
    });
  }

  test('a protected page cannot be opened without logging in', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    await expect(loginPage.errorMessage).toContainText(
      "You can only access '/inventory.html' when you are logged in",
    );
  });
});
