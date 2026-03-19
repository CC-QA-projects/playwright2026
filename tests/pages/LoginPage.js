import { expect } from '@playwright/test';

class LoginPage {
  constructor(page) {
    this.page = page;
    this.loginModalLabel = page.locator('#logInModalLabel');
    this.usernameField = page.locator('#loginusername');
    this.passwordField = page.locator('#loginpassword');
    this.submitButton = page.getByRole('button', { name: 'Log in' });
    this.welcomeUser = page.locator('#nameofuser');
    this.logoutLink = page.getByRole('link', { name: 'Log out' });
    this.signUpLink = page.getByRole('link', { name: 'Sign up' });
    this.loginLink = page.getByRole('link', { name: 'Log in' });
  }
  async openLoginModal() {
    await this.loginLink.click();
  }

  async isLoginmodalVisible() {
    await expect(this.loginModalLabel).toBeVisible();
  }
  async login(username, password) {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.submitButton.click();
  }

  async isWelcomeUsernameVisible() {
    await expect(this.welcomeUser).toContainText('Welcome')
  }
  async clickLogout() {
    await this.logoutLink.click();
  }

  async isSignupLinkVisible() {
    await expect(this.signUpLink).toBeVisible();
  }
  async isLoginLinkVisible() {
    await expect(this.loginLink).toBeVisible();
  }
}

export { LoginPage };