import { expect } from '@playwright/test';

class HomePage {
  constructor(page) {
    this.page = page;
    this.navbar = page.locator('#navbarExample');
    this.cart = page.locator('#cartur');
    this.loginBtn = page.locator('#login2');
    this.signupBtn = page.locator('#signin2');
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
