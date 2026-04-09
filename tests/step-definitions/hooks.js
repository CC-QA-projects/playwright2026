import { After, Status } from '@cucumber/cucumber';

After(async function (scenario) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    const screenshot = await this.page.screenshot({ fullPage: true });
    await this.attach(screenshot, 'image/png');
  }

  if (this.browser) {
    await this.browser.close();
    this.browser = undefined;
  }
});
