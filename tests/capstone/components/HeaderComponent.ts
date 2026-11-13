import type { Locator } from '@playwright/test';

/**
 * Component object: the header shown on every page after login.
 * Page objects that show the header create one and expose it as `header`.
 */
export class HeaderComponent {
  readonly root: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.cartLink = root.getByTestId('shopping-cart-link');
    this.cartBadge = root.getByTestId('shopping-cart-badge');
    this.menuButton = root.getByRole('button', { name: 'Open Menu' });
    // The site renders "Logout" as an <a> without href, so it has no link
    // role. A test id is the next most stable choice.
    this.logoutLink = root.getByTestId('logout-sidebar-link');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}
