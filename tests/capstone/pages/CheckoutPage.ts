import type { Locator, Page } from '@playwright/test';
import type { Customer } from '../data/factories';

/**
 * Page object for the three checkout steps:
 * information -> overview -> complete.
 *
 * One class is fine while the steps are small. Split it into one class per
 * step as soon as any step grows its own behavior.
 */
export class CheckoutPage {
  readonly page: Page;

  // Step 1: information
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly errorMessage: Locator;

  // Step 2: overview
  readonly itemNames: Locator;
  readonly itemTotal: Locator;
  readonly finishButton: Locator;

  // Step 3: complete
  readonly confirmationHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.postalCodeInput = page.getByRole('textbox', { name: 'Zip/Postal Code' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.errorMessage = page.getByRole('alert');

    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemTotal = page.getByTestId('subtotal-label');
    this.finishButton = page.getByRole('button', { name: 'Finish' });

    this.confirmationHeading = page.getByRole('heading', { name: 'Thank you for your order!' });
  }

  async fillInformation({ firstName, lastName, postalCode }: Customer): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
