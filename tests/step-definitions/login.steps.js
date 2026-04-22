import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import {
  getGeneratedCredentials,
  openDemoblazeHomePage,
} from './helpers/app-context.js';

Given('I am on the Demoblaze home page', async function () {
  await openDemoblazeHomePage(this);
});

When('I sign up with a generated Demoblaze account', async function () {
  const { username, password } = getGeneratedCredentials(this);
  this.lastDialogMessage = await this.loginPage.signUp(username, password);
});

Then('I should see a signup success alert', function () {
  expect(this.lastDialogMessage).toBe('Sign up successful.');
});

When(
  'I try to sign up again with the same generated Demoblaze account',
  async function () {
    const { username, password } = getGeneratedCredentials(this);
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    this.lastDialogMessage = await this.loginPage.signUp(username, password);
  }
);

Then('I should see a duplicate signup alert', function () {
  expect(this.lastDialogMessage).toBe('This user already exist.');
});

When('I log in with the generated Demoblaze credentials', async function () {
  const { username, password } = getGeneratedCredentials(this);
  await this.loginPage.login(username, password);
});

Then('I should see my generated welcome username', async function () {
  const { username } = getGeneratedCredentials(this);
  await this.loginPage.expectWelcomeUser(username);
});

When(
  'I attempt to log in with the generated username and an invalid password',
  async function () {
    const { username, password } = getGeneratedCredentials(this);
    this.lastDialogMessage = await this.loginPage.loginAndCaptureAlert(
      username,
      `${password}_invalid`
    );
  }
);

Then('I should see a login error alert saying {string}', function (message) {
  expect(this.lastDialogMessage).toBe(message);
});

Then('I should not see a welcome username', async function () {
  await this.loginPage.expectNoWelcomeUser();
});

When('I log out of Demoblaze', async function () {
  await this.loginPage.clickLogout();
});

Then('I should see the Log out link and not the Log in link', async function () {
  await this.loginPage.expectLoggedInNav();
});

Then('I should see the Log in link and not the Log out link', async function () {
  await this.loginPage.expectLoggedOutNav();
});
