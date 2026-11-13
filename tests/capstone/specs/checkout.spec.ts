import { PRODUCTS, formatPrice, totalCents } from '../data/products';
import { test, expect } from '../fixtures';

test.describe('Checkout', () => {
  test(
    'a customer can buy two products',
    { tag: '@smoke' },
    async ({ inventoryPage, cartPage, checkoutPage, customer }) => {
      const products = [PRODUCTS.backpack, PRODUCTS.bikeLight];

      // test.step groups actions into readable chunks in the HTML report and
      // the trace viewer. Name steps after user intent, not after clicks.
      await test.step('add products to the cart', async () => {
        await inventoryPage.goto();
        for (const product of products) {
          await inventoryPage.product(product.name).addToCart();
        }
        await expect(inventoryPage.header.cartBadge).toHaveText(String(products.length));
      });

      await test.step('review the cart', async () => {
        await inventoryPage.header.openCart();
        await expect(cartPage.itemNames).toHaveText(products.map((product) => product.name));
        await cartPage.checkout();
      });

      await test.step('enter customer information', async () => {
        await checkoutPage.fillInformation(customer);
        await checkoutPage.continue();
      });

      await test.step('confirm the order total and finish', async () => {
        await expect(checkoutPage.itemTotal).toHaveText(
          `Item total: ${formatPrice(totalCents(products))}`,
        );
        await checkoutPage.finish();
        await expect(checkoutPage.confirmationHeading).toBeVisible();
      });
    },
  );

  test('checkout requires a first name', async ({ cartPage, checkoutPage, customer }) => {
    await cartPage.goto();
    await cartPage.checkout();

    await checkoutPage.fillInformation({ ...customer, firstName: '' });
    await checkoutPage.continue();

    await expect(checkoutPage.errorMessage).toHaveText('Error: First Name is required');
  });
});
