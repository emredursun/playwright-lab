import { PRODUCTS, SORT_OPTIONS, formatPrice } from '../data/products';
import { test, expect } from '../fixtures';

// These tests start logged in, through the storage state saved by auth.setup.ts.
test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('shows the full catalogue', { tag: '@smoke' }, async ({ inventoryPage }) => {
    // toHaveCount retries until the list has rendered. Never read .count()
    // once and compare it with a plain expect.
    await expect(inventoryPage.productCards).toHaveCount(Object.keys(PRODUCTS).length);
  });

  test('sorts products by price, low to high', async ({ inventoryPage }) => {
    const expectedPrices = Object.values(PRODUCTS)
      .map((product) => product.priceCents)
      .toSorted((a, b) => a - b)
      .map(formatPrice);

    await inventoryPage.sortBy(SORT_OPTIONS.priceAsc);

    // An array asserts every item, in order, and retries as a whole.
    await expect(inventoryPage.productPrices).toHaveText(expectedPrices);
  });

  test('sorts products by name, Z to A', async ({ inventoryPage }) => {
    const expectedNames = Object.values(PRODUCTS)
      .map((product) => product.name)
      .toSorted((a, b) => b.localeCompare(a));

    await inventoryPage.sortBy(SORT_OPTIONS.nameDesc);

    await expect(inventoryPage.productNames).toHaveText(expectedNames);
  });

  test('adding and removing a product updates the cart badge', async ({ inventoryPage }) => {
    const backpack = inventoryPage.product(PRODUCTS.backpack.name);

    await backpack.addToCart();
    await expect(inventoryPage.header.cartBadge).toHaveText('1');
    await expect(backpack.removeButton).toBeVisible();

    await backpack.remove();
    await expect(inventoryPage.header.cartBadge).toBeHidden();
    await expect(backpack.addToCartButton).toBeVisible();
  });

  test('logging out returns to the login page', async ({ page, inventoryPage, loginPage }) => {
    await inventoryPage.header.logout();

    await expect(loginPage.loginButton).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });
});
