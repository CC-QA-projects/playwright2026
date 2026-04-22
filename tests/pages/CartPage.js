import { expect } from '@playwright/test';

class CartPage {
  constructor(page) {
    this.page = page;
    this.cartRows = page.locator('#tbodyid > tr');
    this.totalLabel = page.locator('#totalp');
    this.placeOrderButton = page.getByRole('button', { name: 'Place Order' });
  }

  productRow(productName) {
    return this.cartRows.filter({ hasText: productName });
  }

  async expectProductVisible(productName) {
    await expect(this.page.locator('#tbodyid')).toContainText(productName);
  }

  async expectProductNotVisible(productName) {
    await expect(this.page.locator('#tbodyid')).not.toContainText(productName);
  }

  async removeProduct(productName) {
    const row = this.productRow(productName).first();
    await expect(row).toBeVisible();
    await row.getByRole('link', { name: 'Delete' }).click();
    await expect(this.productRow(productName)).toHaveCount(0);
  }

  async getTotal() {
    const totalText = await this.totalLabel.textContent();
    return Number(totalText?.trim() ?? 0);
  }

  async expectTotal(expectedTotal) {
    await expect
      .poll(async () => this.getTotal(), {
        message: `Expected cart total to become ${expectedTotal}`,
      })
      .toBe(expectedTotal);
  }

  async expectTotalEqualsItemPriceSum() {
    const priceTexts = await this.page
      .locator('#tbodyid > tr td:nth-child(3)')
      .allTextContents();
    const sum = priceTexts.reduce((total, text) => total + Number(text.trim()), 0);

    await expect
      .poll(async () => this.getTotal(), {
        message: 'Expected displayed total to equal the sum of item prices',
      })
      .toBe(sum);
  }

  async getProductPrices(productName) {
    const rows = this.productRow(productName);
    const rowCount = await rows.count();
    const prices = [];

    for (let index = 0; index < rowCount; index += 1) {
      const priceText = await rows.nth(index).locator('td:nth-child(3)').textContent();
      prices.push(Number(priceText?.trim() ?? 0));
    }

    return prices;
  }

  async openPlaceOrder() {
    await this.placeOrderButton.click();
  }
}

export { CartPage };
