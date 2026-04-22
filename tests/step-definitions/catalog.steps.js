import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Then('I should see the main navbar elements', async function () {
  await this.homePage.validateNavbarElements();
});

When('I view the {string} category', async function (category) {
  await this.homePage.openCategory(category);
});

Then('I should see the product {string} in the product list', async function (product) {
  await this.homePage.expectProductInList(product);
});

When('I open the Samsung galaxy s6 product page', async function () {
  await this.homePage.openProduct('Samsung galaxy s6');
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
