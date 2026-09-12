import { When, Then } from '@cucumber/cucumber';

When('I open the place order modal', async function () {
  await this.cartPage.openPlaceOrder();
  await this.checkoutPage.expectOrderModalVisible();
});

Then('the order modal total should be {int}', async function (expectedTotal) {
  await this.checkoutPage.expectModalTotal(expectedTotal);
});

When('I place an order for:', async function (dataTable) {
  const orderDetails = dataTable.rowsHash();
  await this.checkoutPage.placeOrder(orderDetails);
});

Then('I should see the purchase confirmation', async function () {
  await this.checkoutPage.expectConfirmationVisible();
});

Then('the purchase confirmation should include {string}', async function (text) {
  await this.checkoutPage.expectConfirmationContains(text);
});
