import { expect } from '@playwright/test';

class HomePage {
  constructor(page) {
    this.page = page;
    this.navbar = page.locator('#navbarExample');
    this.cart = page.locator('#cartur');
    this.loginBtn = page.locator('#login2');
    this.signupBtn = page.locator('#signin2');
    this.contactLink = page.getByRole('link', { name: 'Contact' });
    this.aboutUsLink = page.getByRole('link', { name: 'About us' });
    this.homeLink = page.getByRole('link', { name: /^Home/ });
    this.productGrid = page.locator('#tbodyid');
    this.addToCartLink = page.getByRole('link', { name: 'Add to cart' });
  }

  async isHomeVisible() {
    await expect(this.navbar).toContainText('Home (current)');
  }

  async isContactVisible() {
    await expect(this.navbar).toContainText('Contact');
  }

  async isAboutUsVisible() {
    await expect(this.navbar).toContainText('About us');
  }

  async isCartVisible() {
    await expect(this.cart).toContainText('Cart');
  }

  async isLoginBtnVisible() {
    await expect(this.loginBtn).toContainText('Log in');
  }

  async isSignupBtnVisible() {
    await expect(this.signupBtn).toContainText('Sign up');
  }

  async openCategory(category) {
    await this.page.getByRole('link', { name: category, exact: true }).click();
    await expect(this.productGrid).toBeVisible();
  }

  async expectProductInList(productName) {
    await expect(this.productGrid).toContainText(productName);
  }

  async openProduct(productName) {
    await this.page.getByRole('link', { name: productName, exact: true }).click();
    await expect(this.addToCartLink).toBeVisible();
  }

  async openCart() {
    await this.page.getByRole('link', { name: 'Cart', exact: true }).click();
    await expect(this.page.locator('#page-wrapper')).toContainText('Products');
  }

  async openHome() {
    await this.homeLink.click();
    await expect(this.productGrid).toBeVisible();
  }

  async addCurrentProductToCart() {
    await this.addToCartLink.click();
  }

  async addProductToCart(category, productName) {
    await this.openCategory(category);
    await this.openProduct(productName);
    await this.addCurrentProductToCart();
  }

  async openContactModal() {
    await this.contactLink.click();
  }

  async openAboutModal() {
    await this.aboutUsLink.click();
  }

  async validateNavbarElements() {
    await this.isHomeVisible();
    await this.isContactVisible();
    await this.isAboutUsVisible();
    await this.isCartVisible();
    await this.isLoginBtnVisible();
    await this.isSignupBtnVisible();
  }
}

export { HomePage };
