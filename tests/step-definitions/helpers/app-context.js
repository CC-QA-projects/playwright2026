import { chromium } from 'playwright';
import { LoginPage } from '../../pages/LoginPage.js';
import { HomePage } from '../../pages/HomePage.js';
import { CartPage } from '../../pages/CartPage.js';
import { CheckoutPage } from '../../pages/CheckoutPage.js';
import { CommonModalsPage } from '../../pages/CommonModalsPage.js';

const BASE_URL = process.env.BASE_URL ?? 'https://demoblaze.com/';
const DEFAULT_HEADLESS = process.env.HEADLESS !== 'false';

function createGeneratedCredentials() {
  const uniqueSuffix = `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;

  return {
    username: `calvin_${uniqueSuffix}`,
    password: `Pwd${uniqueSuffix.slice(-6)}!`,
  };
}

function getGeneratedCredentials(world) {
  if (!world.generatedCredentials) {
    world.generatedCredentials = createGeneratedCredentials();
  }

  return world.generatedCredentials;
}

async function openDemoblazeHomePage(world) {
  world.browser = await chromium.launch({
    headless: DEFAULT_HEADLESS,
    slowMo: Number(process.env.SLOW_MO_MS ?? '0'),
  });
  world.context = await world.browser.newContext();
  world.page = await world.context.newPage();
  world.loginPage = new LoginPage(world.page);
  world.homePage = new HomePage(world.page);
  world.cartPage = new CartPage(world.page);
  world.checkoutPage = new CheckoutPage(world.page);
  world.commonModalsPage = new CommonModalsPage(world.page);

  await world.page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
}

export { getGeneratedCredentials, openDemoblazeHomePage };
