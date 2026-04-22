# Demoblaze UI Automation

Playwright + Cucumber tests for the main Demoblaze user journeys.

## What It Tests

- Authentication: sign up, duplicate signup, valid login, invalid login
- Catalog browsing: navbar, categories, product details, carousel
- Cart: add items, remove specific items, total validation
- Checkout: place order and verify purchase confirmation
- Site modals: Contact and About us

## Run It

Install dependencies and Playwright's browser once:

```bash
npm install
npx playwright install chromium
```

Run the suite or a focused area:

```bash
npm run test:cucumber
npm run test:cucumber:smoke
npm run test:cucumber:regression
npm run test:cucumber:auth
npm run test:cucumber:cart
npm run test:cucumber:checkout
npm run test:cucumber:modals
```

## Reports

Cucumber writes Allure results to `reports/allure-results`.

```bash
npm run allure:serve
npm run allure:generate
npm run allure:open
```

Failed scenarios attach screenshots automatically.