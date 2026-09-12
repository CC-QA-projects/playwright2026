import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

class HomePage extends BasePage {
  constructor(page) {
    super(page);
    this.navbar = page.locator('#navbarExample');
    this.cart = page.locator('#cartur');
    this.loginBtn = page.locator('#login2');
    this.signupBtn = page.locator('#signin2');
    this.contactLink = page.getByRole('link', { name: 'Contact' });
    this.aboutUsLink = page.getByRole('link', { name: 'About us' });
    this.homeLink = page.getByRole('link', { name: /^Home/ });
    this.productGrid = page.locator('#tbodyid');
    this.addToCartLink = page.getByRole('link', { name: 'Add to cart' });
    this.carouselNextBtn = page
      .locator('#carouselExampleIndicators')
      .getByRole('button', { name: 'Next' });
    this.carouselPrevBtn = page
      .locator('#carouselExampleIndicators')
      .getByRole('button', { name: 'Previous' });
    this.firstSlideImg = page.getByRole('img', { name: 'First slide' });
    this.secondSlideImg = page.getByRole('img', { name: 'Second slide' });
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
    const categoryLoaded = this.page.waitForResponse(
      (response) => response.url().includes('/bycat') && response.request().method() === 'POST'
    );
    await this.page.getByRole('link', { name: category, exact: true }).click();
    await categoryLoaded;
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
    const cartLoaded = this.page.waitForResponse(
      (response) => response.url().includes('/viewcart') && response.request().method() === 'POST'
    );
    await this.page.getByRole('link', { name: 'Cart', exact: true }).click();
    await cartLoaded;
    await expect(this.page.locator('#page-wrapper')).toContainText('Products');
  }

  async openHome() {
    const homeLoaded = this.page.waitForResponse(
      (response) => response.url().includes('/entries') && response.request().method() === 'GET'
    );
    await this.homeLink.click();
    await homeLoaded;
    await expect(this.productGrid).toBeVisible();
  }

  async addProductToCart(category, productName) {
    await this.openCategory(category);
    await this.openProduct(productName);
    return this.captureDialogMessage(() => this.addToCartLink.click());
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

  async clickCarouselNext() {
    await this.carouselNextBtn.click();
  }

  async clickCarouselPrevious() {
    await this.carouselPrevBtn.click();
  }

  async expectFirstSlideVisible() {
    await expect(this.firstSlideImg).toBeVisible();
  }

  async expectSecondSlideVisible() {
    await expect(this.secondSlideImg).toBeVisible();
  }
}

export { HomePage };
