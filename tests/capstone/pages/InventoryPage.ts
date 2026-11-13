import type { Locator, Page } from '@playwright/test';
import { HeaderComponent } from '../components/HeaderComponent';
import { ProductCard } from '../components/ProductCard';
import type { SortOption } from '../data/products';

/** Page object for the product list shown after login. */
export class InventoryPage {
  readonly page: Page;
  readonly header: HeaderComponent;
  readonly title: Locator;
  readonly sortSelect: Locator;
  readonly productCards: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page.getByTestId('header-container'));
    this.title = page.getByTestId('title');
    this.sortSelect = page.getByRole('combobox', { name: 'Sort products' });
    this.productCards = page.getByTestId('inventory-item');
    this.productNames = page.getByTestId('inventory-item-name');
    this.productPrices = page.getByTestId('inventory-item-price');
  }

  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  /** Returns a component for the card whose text contains `productName`. */
  product(productName: string): ProductCard {
    return new ProductCard(this.productCards.filter({ hasText: productName }));
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption({ label: option });
  }
}
