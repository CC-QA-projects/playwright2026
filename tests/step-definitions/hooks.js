import { After, Status, setDefaultTimeout } from '@cucumber/cucumber';

setDefaultTimeout(Number(process.env.CUCUMBER_STEP_TIMEOUT_MS ?? '30000'));

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
