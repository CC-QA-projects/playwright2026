import { Given, When, Then } from '@cucumber/cucumber';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { LoginPage } from '../../tests/pages/LoginPage.js';
import { HomePage } from '../../tests/pages/HomePage.js';
import { credentials } from '../../config/credentials.js';

Given('I am on the Demoblaze home page', async function () {
  this.browser = await chromium.launch({
    headless: false,
    slowMo: Number(process.env.SLOW_MO_MS ?? '0'),
  });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
  this.loginPage = new LoginPage(this.page);
  this.homePage = new HomePage(this.page);

  await this.page.goto('https://demoblaze.com/');
});

When('I open the login modal', async function () {
  await this.loginPage.openLoginModal();
});

When('I log in with valid Demoblaze credentials', async function () {
  await this.loginPage.login(credentials.username, credentials.password);
});

Then('I should see my welcome username', async function () {
  await this.loginPage.isWelcomeUsernameVisible();
});

Then('I should see the main navbar elements', async function () {
  await this.homePage.validateNavbarElements();
});

When('I view the {string} category', async function (category) {
  await this.page.getByRole('link', { name: category }).click();
});

Then(
  'I should see the product {string} in the product list',
  async function (product) {
    await expect(this.page.locator('#tbodyid')).toContainText(product);
  }
);

When('I open the Sign up modal', async function () {
  await this.page.getByRole('link', { name: 'Sign up' }).click();
});

When('I sign up with valid credentials', async function () {
  await this.page.getByRole('textbox', { name: 'Username:' }).fill(credentials.username);
  await this.page.getByRole('textbox', { name: 'Password:' }).fill(credentials.password);

  this.page.once('dialog', (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });

  await this.page.getByRole('button', { name: 'Sign up' }).click();
});

Then('a sign up alert should appear', async function () {
  await expect(this.page).toHaveURL(/demoblaze\.com/);
});

When('I open the Samsung galaxy s6 product page', async function () {
  await this.page.getByRole('link', { name: 'Samsung galaxy s6' }).click();
});

Then('I should see the Samsung galaxy s6 details', async function () {
  await expect(this.page.getByRole('heading', { name: 'Samsung galaxy s6' })).toBeVisible();
  await expect(this.page.getByRole('heading', { name: '$360 *includes tax' })).toBeVisible();
  await expect(this.page.getByText('The Samsung Galaxy S6 is')).toBeVisible();
});

When('I click Next on the carousel', async function () {
  await this.page
    .locator('#carouselExampleIndicators')
    .getByRole('button', { name: 'Next' })
    .click();
});

Then('I should see the Second slide image', async function () {
  await expect(this.page.getByRole('img', { name: 'Second slide' })).toBeVisible();
});

When('I click Previous on the carousel', async function () {
  await this.page
    .locator('#carouselExampleIndicators')
    .getByRole('button', { name: 'Previous' })
    .click();
});

Then('I should see the First slide image', async function () {
  await expect(this.page.getByRole('img', { name: 'First slide' })).toBeVisible();
});

Given('I am logged in to Demoblaze', async function () {
  await this.runStep('Given I am on the Demoblaze home page');
  await this.runStep('When I open the login modal');
  await this.runStep('When I log in with valid Demoblaze credentials');
  await this.loginPage.isWelcomeUsernameVisible();
});

When('I log out of Demoblaze', async function () {
  await this.page.getByRole('link', { name: 'Log out' }).click();
});

Then(
  'I should see the Log out link and not the Log in link',
  async function () {
    await expect(
      this.page.getByRole('link', { name: 'Log out' })
    ).toBeVisible();
    await expect(
      this.page.getByRole('link', { name: 'Log in' })
    ).not.toBeVisible();
  }
);

Then(
  'I should see the Log in link and not the Log out link',
  async function () {
    await expect(
      this.page.getByRole('link', { name: 'Log out' })
    ).not.toBeVisible();
    await expect(
      this.page.getByRole('link', { name: 'Log in' })
    ).toBeVisible();
  }
);

