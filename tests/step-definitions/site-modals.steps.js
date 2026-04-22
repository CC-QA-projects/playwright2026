import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

function createContactDetails() {
  const uniqueSuffix = Date.now().toString();

  return {
    email: `calvin.${uniqueSuffix}@example.com`,
    name: 'Calvin Tester',
    message: 'Please confirm that the checkout flow is available.',
  };
}

When('I send a contact message through the Contact modal', async function () {
  this.contactDetails = createContactDetails();
  await this.homePage.openContactModal();
  this.lastDialogMessage = await this.commonModalsPage.sendContactMessage(
    this.contactDetails
  );
});

Then('I should see a contact success alert', function () {
  expect(this.lastDialogMessage).toBe('Thanks for the message!!');
});

When('I open the About us modal', async function () {
  await this.homePage.openAboutModal();
});

Then('I should see the About us modal content', async function () {
  await this.commonModalsPage.expectAboutModalContent();
});
