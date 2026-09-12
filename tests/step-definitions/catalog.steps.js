import { When, Then } from '@cucumber/cucumber';

Then('I should see the main navbar elements', async function () {
  await this.homePage.validateNavbarElements();
});

When('I view the {string} category', async function (category) {
  await this.homePage.openCategory(category);
});

Then('I should see the product {string} in the product list', async function (product) {
  await this.homePage.expectProductInList(product);
});

When('I open the {string} product page', async function (productName) {
  await this.homePage.openProduct(productName);
});

Then('I should see the {string} product details', async function (productName) {
  await this.productPage.expectProductDetails(productName);
});

When('I click Next on the carousel', async function () {
  await this.homePage.clickCarouselNext();
});

Then('I should see the Second slide image', async function () {
  await this.homePage.expectSecondSlideVisible();
});

When('I click Previous on the carousel', async function () {
  await this.homePage.clickCarouselPrevious();
});

Then('I should see the First slide image', async function () {
  await this.homePage.expectFirstSlideVisible();
});
