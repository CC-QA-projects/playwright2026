# Playwright Interview Framework

UI automation framework for [Demoblaze](https://demoblaze.com/) built with `Playwright`, `JavaScript`, `Cucumber`, `Page Object Model`, and `Allure`.

## Overview

This project is designed to keep UI tests readable, reusable, and easy to scale. Business flows are written in Gherkin, mapped to step definitions, and backed by page objects that centralize selectors and page actions.

## Framework

- `Playwright` for browser automation
- `JavaScript` with ES modules
- `Cucumber` for BDD feature files and step definitions
- `Page Object Model` for reusable UI interactions
- `Allure` for reporting and failure screenshots

## Highlights

- Clean separation between `features`, `step-definitions`, and `pages`
- Reusable page object layer to reduce locator duplication
- Allure reporting wired into Cucumber runs
- Full-page screenshot captured automatically on failed scenarios
- Targeted smoke, regression, and feature-level execution commands

## Test Coverage

Current Demoblaze coverage includes:

- Authentication: sign up, duplicate signup, valid login, invalid login
- Catalog: navbar, categories, product details, carousel behavior
- Cart: add item, remove item, validate totals
- Checkout: complete purchase and verify confirmation
- Site modals: Contact and About Us

## Installation

Prerequisites:

- `Node.js` 18+
- `npm`
- `Java` if you want to open Allure reports locally

Install dependencies and browser binaries:

```bash
npm install
npx playwright install chromium
```

## Important Scripts

```bash
npm run test:cucumber
npm run test:cucumber:smoke
npm run test:cucumber:regression
npm run test:cucumber:auth
npm run test:cucumber:cart
npm run test:cucumber:checkout
npm run test:cucumber:modals
npm run test:cucumber:smoke:allure
npm run test:cucumber:regression:allure
npm run allure:generate
npm run allure:open
```

Other useful commands:

```bash
npm test
npm run test:ui
npm run report
```

## How To Use

Run the full Cucumber suite:

```bash
npm run test:cucumber
```

Run a focused suite:

```bash
npm run test:cucumber:smoke
npm run test:cucumber:modals
```

Run by tag:

```bash
npm run test:cucumber:tag -- "@smoke"
```

Generate and open an Allure report after a run:

```bash
npm run allure:generate
npm run allure:open
```

One-command smoke run with Allure:

```bash
npm run test:cucumber:smoke:allure
```

## Configuration

Useful environment variables:

- `BASE_URL` to override the target application URL
- `HEADLESS=false` to run headed
- `SLOW_MO_MS=1000` to slow browser actions for debugging
- `CUCUMBER_STEP_TIMEOUT_MS` to change the step timeout
- `CUCUMBER_SCENARIO_LOGS=false` to disable live scenario logging

Windows examples:

```bash
set HEADLESS=false&& npm run test:cucumber
set SLOW_MO_MS=1000&& npm run test:cucumber:auth
set BASE_URL=https://demoblaze.com/&& npm run test:cucumber
```