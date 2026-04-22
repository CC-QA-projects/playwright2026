import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { openDemoblazeHomePage } from './helpers/app-context.js';

const productCategories = {
  'Iphone 6 32gb': 'Phones',
  'Samsung galaxy s6': 'Phones',
  'Sony vaio i5': 'Laptops',
  'Apple monitor 24': 'Monitors',
};

function getCategoryForProduct(productName) {
  const category = productCategories[productName];

  if (!category) {
    throw new Error(`No category mapping exists for product "${productName}"`);
  }

  return category;
}

async function addProductToCart(world, productName, category) {
  const dialogPromise = world.page.waitForEvent('dialog');
  await world.homePage.addProductToCart(category, productName);
  const dialog = await dialogPromise;
  world.lastDialogMessage = dialog.message();
  await dialog.accept();
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

When('I remove {string} from the cart', async function (productName) {
  await this.cartPage.removeProduct(productName);
});

Then(
  'I should not see {string} in the cart',
  async function (productName) {
    await this.cartPage.expectProductNotVisible(productName);
  }
);

Then('I should still see {string} in the cart', async function (productName) {
  await this.cartPage.expectProductVisible(productName);
});

Then('the cart total should equal {int}', async function (expectedTotal) {
  await this.cartPage.expectTotal(expectedTotal);
});

Given(
  'I have "Samsung galaxy s6" and "Sony vaio i5" in the cart',
  async function () {
    await openDemoblazeHomePage(this);
    await addProductToCart(this, 'Samsung galaxy s6', 'Phones');
    await this.homePage.openHome();
    await addProductToCart(this, 'Sony vaio i5', 'Laptops');
  }
);

Then(
  'the cart total should equal the sum of item prices',
  async function () {
    await this.cartPage.expectTotalEqualsItemPriceSum();
  }
);

When(
  'I add {string} to the cart 2 times',
  async function (productName) {
    const category = getCategoryForProduct(productName);
    for (let i = 0; i < 2; i += 1) {
      if (i > 0) {
        await this.homePage.openHome();
      }
      await addProductToCart(this, productName, category);
    }
  }
);

Then(
  'the cart total should be price x2 for {string}',
  async function (productName) {
    const itemPrices = await this.cartPage.getProductPrices(productName);

    expect(itemPrices.length).toBe(2);
    expect(itemPrices[0]).toBe(itemPrices[1]);
    await this.cartPage.expectTotal(itemPrices[0] * 2);
  }
);
