import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

class ProductPage extends BasePage {
  constructor(page) {
    super(page);
    this.addToCartLink = page.getByRole('link', { name: 'Add to cart' });
    this.priceHeading = page.getByRole('heading', { name: /\$\d+/ });
  }

  productHeading(productName) {
    return this.page.getByRole('heading', { name: productName });
  }

  async expectProductDetails(productName) {
    await expect(this.productHeading(productName)).toBeVisible();
    await expect(this.priceHeading).toBeVisible();
    await expect(this.addToCartLink).toBeVisible();
  }

  async getDisplayedPrice() {
    const priceText = await this.priceHeading.textContent();
    const match = (priceText ?? '').match(/\$(\d+)/);

    if (!match) {
      throw new Error(`Could not parse a product price from "${priceText}"`);
    }

    return Number(match[1]);
  }

  async addToCart() {
    return this.captureDialogMessage(() => this.addToCartLink.click());
  }
}

export { ProductPage };
