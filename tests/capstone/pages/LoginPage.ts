import type { Locator, Page } from '@playwright/test';
import type { Credentials } from '../data/users';

/**
 * Page object for the login screen.
 *
 * Rules every page object in this framework follows:
 *   - Locators are public `readonly` fields, created once in the constructor.
 *     Tests assert on them with web-first assertions, which retry:
 *       await expect(loginPage.errorMessage).toHaveText(/locked out/);
 *   - Actions are small async methods named after what the USER does.
 *   - No assertions inside page objects. The test decides what "correct" is.
 *   - Locators use what the user sees (role, accessible name) first and
 *     test ids second. No CSS or XPath.
 *   - Fields are assigned explicitly. Constructor parameter properties are
 *     not erasable syntax (Lesson 17).
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto(): Promise<void> {
    await this.page.goto('/'); // relative to `baseURL` in playwright.config.ts
  }

  async login({ username, password }: Credentials): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
