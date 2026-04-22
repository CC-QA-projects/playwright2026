import { expect } from '@playwright/test';

class CheckoutPage {
  constructor(page) {
    this.page = page;
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

  async expectConfirmationVisible() {
    await expect(this.confirmationTitle).toBeVisible();
    await expect(this.confirmationDetails).toBeVisible();
  }

  async expectConfirmationContains(text) {
    await expect(this.confirmationDetails).toContainText(text);
  }
}

export { CheckoutPage };
