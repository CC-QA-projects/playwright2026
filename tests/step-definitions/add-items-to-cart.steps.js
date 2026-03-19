import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

When(
  'I add {string} from the Phones category to the cart',
  async function (productName) {
    const page = this.page;
    await page.getByRole('link', { name: 'Phones' }).click();
    await page.getByRole('link', { name: productName }).click();

    page.once('dialog', (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });

    await page.getByRole('link', { name: 'Add to cart' }).click();
    await page.getByRole('link', { name: 'Cart', exact: true }).click();
  }
);

Then('I should see {string} in the cart', async function (productName) {
  await expect(this.page.locator('#tbodyid')).toContainText(productName);
});

Given('I have {string} in the cart', async function (productName) {
  await this.runStep('Given I am on the Demoblaze home page');
  await this.runStep(
    `When I add "${productName}" from the Phones category to the cart`
  );
});

When('I remove {string} from the cart', async function () {
  await this.page.getByRole('link', { name: 'Delete' }).click();
});

Then(
  'I should not see {string} in the cart',
  async function (productName) {
    await expect(this.page.locator('#tbodyid')).not.toContainText(productName);
  }
);

Given('I have "Samsung galaxy s6" in the cart', async function () {
  await this.runStep('Given I am on the Demoblaze home page');

  const page = this.page;
  await page.getByRole('link', { name: 'Samsung galaxy s6' }).click();
  const dialogPromise = page.waitForEvent('dialog');
  await page.getByRole('link', { name: 'Add to cart' }).click();
  await (await dialogPromise).accept();

  await page.getByRole('link', { name: 'Cart', exact: true }).click();
});

When('I place an order', async function () {
  await this.page.getByRole('button', { name: 'Place Order' }).click();
});

Then('the order total should be 360', async function () {
  await expect(this.page.locator('#totalm')).toContainText('Total: 360');
});

Given(
  'I have "Samsung galaxy s6" and "Sony vaio i5" in the cart',
  async function () {
    await this.runStep('Given I am on the Demoblaze home page');

    const page = this.page;
    // First item
    await page.getByRole('link', { name: 'Samsung galaxy s6' }).click();
    let dialogPromise = page.waitForEvent('dialog');
    await page.getByRole('link', { name: 'Add to cart' }).click();
    await (await dialogPromise).accept();

    // Second item
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByRole('link', { name: 'Sony vaio i5' }).click();
    dialogPromise = page.waitForEvent('dialog');
    await page.getByRole('link', { name: 'Add to cart' }).click();
    await (await dialogPromise).accept();

    await page.getByRole('link', { name: 'Cart', exact: true }).click();
  }
);

Then(
  'the cart total should equal the sum of item prices',
  async function () {
    const page = this.page;
    const priceTexts = await page
      .locator('#tbodyid > tr td:nth-child(3)')
      .allTextContents();
    const sum = priceTexts.reduce(
      (total, t) => total + Number(t.trim()),
      0
    );

    const totalText = await page.locator('#totalp').textContent();
    const displayedTotal = Number(totalText?.trim());

    console.log(`Sum of item prices: ${sum}`);
    console.log(`Displayed total: ${displayedTotal}`);

    expect(displayedTotal).toBe(sum);
  }
);
