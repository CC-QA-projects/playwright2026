class BasePage {
  constructor(page) {
    this.page = page;
  }

  async captureDialogMessage(triggerAction) {
    const dialogPromise = this.page.waitForEvent('dialog');
    const actionPromise = Promise.resolve().then(() => triggerAction());
    const dialog = await dialogPromise;
    const message = dialog.message();

    await dialog.accept();
    await actionPromise.catch(() => {});

    return message;
  }
}

export { BasePage };
