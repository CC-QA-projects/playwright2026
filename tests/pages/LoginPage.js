import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.loginModalLabel = page.locator('#logInModalLabel');
    this.usernameField = page.locator('#loginusername');
    this.passwordField = page.locator('#loginpassword');
    this.submitButton = page.getByRole('button', { name: 'Log in' });
    this.signupModalLabel = page.locator('#signInModalLabel');
    this.signupModal = page.locator('#signInModal');
    this.signupUsernameField = page.locator('#sign-username');
    this.signupPasswordField = page.locator('#sign-password');
    this.signupSubmitButton = page.locator('#signInModal').getByRole('button', {
      name: 'Sign up',
    });
    this.welcomeUser = page.locator('#nameofuser');
    this.logoutLink = page.getByRole('link', { name: 'Log out' });
    this.signUpLink = page.getByRole('link', { name: 'Sign up' });
    this.loginLink = page.getByRole('link', { name: 'Log in' });
  }

  async openLoginModal() {
    await this.loginLink.click();
    await expect(this.loginModalLabel).toBeVisible();
  }

  async openSignupModal() {
    await expect(this.signupModal).toBeHidden({ timeout: 10000 });
    await this.signUpLink.click();
    await expect(this.signupModalLabel).toBeVisible();
  }

  async isLoginmodalVisible() {
    await expect(this.loginModalLabel).toBeVisible();
  }

  async login(username, password) {
    await this.openLoginModal();
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.submitButton.click();
  }

  async loginAndCaptureAlert(username, password) {
    await this.openLoginModal();
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);

    return this.captureDialogMessage(async () => {
      await this.submitButton.click();
    });
  }

  async signUp(username, password) {
    await this.openSignupModal();
    await this.signupUsernameField.fill(username);
    await this.signupPasswordField.fill(password);

    const message = await this.captureDialogMessage(async () => {
      await this.signupSubmitButton.click();
    });

    await expect(this.signupModal).toBeHidden({ timeout: 10000 });

    return message;
  }

  async expectWelcomeUser(username) {
    await expect(this.welcomeUser).toContainText(`Welcome ${username}`);
  }

  async expectNoWelcomeUser() {
    await expect(this.welcomeUser).not.toBeVisible();
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

  async expectLoggedInNav() {
    await expect(this.logoutLink).toBeVisible();
    await expect(this.loginLink).not.toBeVisible();
  }

  async expectLoggedOutNav() {
    await expect(this.logoutLink).not.toBeVisible();
    await expect(this.loginLink).toBeVisible();
  }
}

export { LoginPage };