import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);
    this.orderModalLabel = page.locator('#orderModalLabel');
    this.nameField = page.locator('#name');
    this.countryField = page.locator('#country');
    this.cityField = page.locator('#city');
    this.cardField = page.locator('#card');
    this.monthField = page.locator('#month');
    this.yearField = page.locator('#year');
    this.purchaseButton = page.locator('#orderModal').getByRole('button', {
      name: 'Purchase',
    });
    this.modalTotal = page.locator('#totalm');
    this.confirmationTitle = page.getByText('Thank you for your purchase!');
    this.confirmationDetails = page.locator('.sweet-alert p');
    this.confirmationDialog = page.locator('.sweet-alert');
    this.confirmationOkButton = page.locator('.sweet-alert button.confirm');
  }

  async expectOrderModalVisible() {
    await expect(this.orderModalLabel).toBeVisible();
  }

  async expectModalTotal(expectedTotal) {
    await expect(this.modalTotal).toContainText(`Total: ${expectedTotal}`);
  }

  async fillOrderDetails(orderDetails) {
    await this.nameField.fill(orderDetails.name);
    await this.countryField.fill(orderDetails.country);
    await this.cityField.fill(orderDetails.city);
    await this.cardField.fill(orderDetails.card);
    await this.monthField.fill(orderDetails.month);
    await this.yearField.fill(orderDetails.year);
  }

  async submitPurchase() {
    await this.purchaseButton.click();
  }

  async placeOrder(orderDetails) {
    await this.fillOrderDetails(orderDetails);
    await this.submitPurchase();
  }

  async submitPurchaseAndCaptureAlert() {
    return this.captureDialogMessage(async () => {
      await this.purchaseButton.evaluate((button) => button.click());
    });
  }

  // SweetAlert only binds its confirm handler once the dialog finishes opening
  // and gains the "visible" class; clicking OK before then is silently ignored.
  async acknowledgeConfirmation() {
    await expect(this.confirmationDialog).toHaveClass(/visible/);
    const redirectedHome = this.page.waitForURL(/index\.html/, {
      waitUntil: 'domcontentloaded',
    });
    await this.confirmationOkButton.click();
    await redirectedHome;
  }

  async expectConfirmationVisible() {
    await expect(this.confirmationTitle).toBeVisible();
    await expect(this.confirmationDetails).toBeVisible();
  }

  async expectConfirmationContains(text) {
    await expect(this.confirmationDetails).toContainText(text);
  }
}

export { CheckoutPage };
