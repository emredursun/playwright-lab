import type { Locator } from '@playwright/test';

/**
 * Component object: one product card on the inventory page.
 *
 * A component takes a ROOT Locator instead of the whole page, and every
 * locator inside it is scoped to that root. The same class therefore works
 * for any card, wherever it appears. Prefer this kind of composition over
 * deep BasePage inheritance chains.
 */
export class ProductCard {
  readonly root: Locator;
  readonly name: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.name = root.getByTestId('inventory-item-name');
    this.price = root.getByTestId('inventory-item-price');
    this.addToCartButton = root.getByRole('button', { name: 'Add to cart' });
    this.removeButton = root.getByRole('button', { name: 'Remove' });
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async remove(): Promise<void> {
    await this.removeButton.click();
  }
}
