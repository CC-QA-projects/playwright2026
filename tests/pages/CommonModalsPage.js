import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

class CommonModalsPage extends BasePage {
  constructor(page) {
    super(page);
    this.contactModalLabel = page.locator('#exampleModalLabel');
    this.contactEmailField = page.locator('#recipient-email');
    this.contactNameField = page.locator('#recipient-name');
    this.contactMessageField = page.locator('#message-text');
    this.sendMessageButton = page.locator('#exampleModal').getByRole('button', {
      name: 'Send message',
    });
    this.aboutModalLabel = page.locator('#videoModalLabel');
    this.aboutVideo = page.locator('#video1');
  }

  async sendContactMessage(contactDetails) {
    await expect(this.contactModalLabel).toBeVisible();
    await this.contactEmailField.fill(contactDetails.email);
    await this.contactNameField.fill(contactDetails.name);
    await this.contactMessageField.fill(contactDetails.message);

    return this.captureDialogMessage(async () => {
      await this.sendMessageButton.evaluate((button) => button.click());
    });
  }

  async expectAboutModalContent() {
    await expect(this.aboutModalLabel).toHaveText('About us');
    await expect(this.page.locator('#example-video_html5_api')).toHaveCount(1);
    await expect(this.page.locator('#videoModal .modal-body')).toContainText(
      'Video Player is loading.'
    );
  }
}

export { CommonModalsPage };
