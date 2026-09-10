import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

class ProductPage extends BasePage {
  constructor(page) {
    super(page);
    this.addToCartLink = page.getByRole('link', { name: 'Add to cart' });
  }

  async expectProductDetails(productName) {
    await expect(this.page.getByRole('heading', { name: productName })).toBeVisible();
    await expect(this.page.getByRole('heading', { name: /\$\d+/ })).toBeVisible();
    await expect(this.addToCartLink).toBeVisible();
  }
}

export { ProductPage };
