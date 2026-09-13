import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { openDemoblazeHomePage } from './helpers/app-context.js';
import { getCategoryForProduct } from './helpers/test-data.js';

async function addProductToCart(world, productName, category) {
  world.lastDialogMessage = await world.homePage.addProductToCart(category, productName);
  await world.homePage.openCart();
}

When(
  'I add {string} from the {string} category to the cart',
  async function (productName, category) {
    await addProductToCart(this, productName, category);
  }
);

Then('I should see {string} in the cart', async function (productName) {
  await this.cartPage.expectProductVisible(productName);
});

Given('I have {string} in the cart', async function (productName) {
  await openDemoblazeHomePage(this);
  await addProductToCart(this, productName, getCategoryForProduct(productName));
});

Given('I have {string} and {string} in the cart', async function (product1, product2) {
  await openDemoblazeHomePage(this);
  await addProductToCart(this, product1, getCategoryForProduct(product1));
  await this.homePage.openHome();
  await addProductToCart(this, product2, getCategoryForProduct(product2));
});

When('I remove {string} from the cart', async function (productName) {
  await this.cartPage.removeProduct(productName);
});

Then('I should not see {string} in the cart', async function (productName) {
  await this.cartPage.expectProductNotVisible(productName);
});

Then('I should still see {string} in the cart', async function (productName) {
  await this.cartPage.expectProductVisible(productName);
});

Then('the cart total should equal {int}', async function (expectedTotal) {
  await this.cartPage.expectTotal(expectedTotal);
});

Then('the cart total should equal the sum of item prices', async function () {
  await this.cartPage.expectTotalEqualsItemPriceSum();
});

When('I add {string} to the cart 2 times', async function (productName) {
  const category = getCategoryForProduct(productName);
  for (let i = 0; i < 2; i += 1) {
    if (i > 0) {
      await this.homePage.openHome();
    }
    await addProductToCart(this, productName, category);
  }
});

When('I open the cart', async function () {
  await this.homePage.openCart();
});

Then('the cart should be empty', async function () {
  await this.cartPage.expectEmpty();
});

When('I add the open product to the cart', async function () {
  this.productPagePrice = await this.productPage.getDisplayedPrice();
  this.lastDialogMessage = await this.productPage.addToCart();
  await this.homePage.openCart();
});

Then(
  'the cart price for {string} should equal its product page price',
  async function (productName) {
    const [cartPrice] = await this.cartPage.getProductPrices(productName);

    expect(cartPrice).toBe(this.productPagePrice);
  }
);

Then('the cart total should be price x2 for {string}', async function (productName) {
  const itemPrices = await this.cartPage.getProductPrices(productName);

  expect(itemPrices.length).toBe(2);
  expect(itemPrices[0]).toBe(itemPrices[1]);
  await this.cartPage.expectTotal(itemPrices[0] * 2);
});
