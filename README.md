# Playwright Interview Framework

UI automation framework for the [Demoblaze](https://demoblaze.com/) demo application built with `Playwright + JavaScript`, organized with the `Page Object Model (POM)`, executed through `Cucumber` for BDD-style scenarios, and reported with `Allure`.

The project is also set up to work well in `Cursor`, including a repo-local Cursor skill for reviewing Playwright locator quality and page object patterns.

## Overview

This framework is designed to keep test code readable, scalable, and easy to debug:

- `Playwright` drives browser automation and can also support API testing
- `JavaScript` keeps the setup lightweight and approachable
- `Cucumber` maps business-readable `.feature` files to step definitions
- `POM` centralizes locators and page behavior in reusable page objects
- `Allure` provides rich test reporting with screenshots on failures
- `Cursor` can be used as the primary AI-assisted editor for test creation, refactoring, and locator review

## Framework Highlights

- BDD scenarios written in Gherkin under `tests/features`
- Reusable page objects under `tests/pages`
- Shared browser/page bootstrap logic in `tests/step-definitions/helpers`
- Allure result generation for Cucumber runs
- Automatic screenshot attachment for failed scenarios
- GitHub Actions workflow included for CI execution
- Playwright test runner support also exists for non-Cucumber cases, including API tests

## Current Test Coverage

The repository currently covers these main Demoblaze journeys:

- Authentication: sign up, duplicate signup, valid login, invalid login
- Catalog browsing: navbar, categories, product details, carousel behavior
- Cart flows: add items, remove items, validate totals
- Checkout: place order and verify purchase confirmation
- Site modals: Contact and About Us

## Architecture

### 1. Playwright with JavaScript

Playwright is the automation engine used to drive Chromium-based UI tests and support additional test types such as API validation. The project is configured as an ES module JavaScript repo via `package.json`.

### 2. POM with Cucumber

The framework follows a Page Object Model structure:

- `tests/pages/*.js` contains page classes such as `HomePage`, `LoginPage`, `CartPage`, and `CheckoutPage`
- `tests/features/*.feature` contains business-readable scenarios
- `tests/step-definitions/*.js` connects Gherkin steps to the page object methods

This keeps test intent readable while reducing locator duplication and step-definition clutter.

### 3. Allure Reporting

Allure is wired through `cucumber.mjs` using `allure-cucumberjs/reporter`, with results written to `reports/allure-results`.

When a scenario fails, the Cucumber `After` hook captures a full-page screenshot and attaches it to the Allure result.

### 4. Cursor Integration

This repo is friendly to `Cursor` workflows:

- Open the project in Cursor and use AI chat to generate or refine page objects, steps, and feature files
- Cursor works especially well here for:
  - generating new Cucumber scenarios from acceptance criteria
  - refactoring duplicated selectors into page objects
  - reviewing flaky locators in `tests/pages` and `tests/step-definitions`
  - documenting new commands and improving reporting workflows

Example prompts you can use in Cursor:

- `Review the locators in tests/pages/LoginPage.js and suggest more stable Playwright selectors`
- `Create a new Cucumber feature and step definitions for product deletion from the cart`
- `Refactor duplicated selectors in step definitions into the HomePage page object`
- `Help debug why this scenario is failing and what will appear in Allure`

## Prerequisites

- `Node.js` 18+ recommended
- `npm`
- `Java` installed if you want to use the Allure CLI locally

## Installation

Install project dependencies:

```bash
npm install
```

Install the required Playwright browser:

```bash
npx playwright install chromium
```

If you want full CI-style browser dependencies, you can also use:

```bash
npx playwright install --with-deps
```

## Running The Test Suites

### Run the Cucumber UI suite

```bash
npm run test:cucumber
```

### Run targeted Cucumber suites

```bash
npm run test:cucumber:smoke
npm run test:cucumber:regression
npm run test:cucumber:auth
npm run test:cucumber:cart
npm run test:cucumber:checkout
npm run test:cucumber:modals
```

### Run by tag

```bash
npm run test:cucumber:tag -- "@smoke"
```

### Run Playwright-native tests

The repo also contains Playwright runner support, which can be useful for API tests or non-BDD checks:

```bash
npm test
npm run test:ui
npm run report
```

## Allure Reporting

Generate, open, or serve Allure reports:

```bash
npm run allure:clean
npm run allure:generate
npm run allure:open
```

Or serve the latest results directly:

```bash
npm run allure:serve
```

Useful workflow:

```bash
npm run test:cucumber
npm run allure:generate
npm run allure:open
```

Generated output locations:

- Allure raw results: `reports/allure-results`
- Allure HTML report: `reports/allure-report`

## Configuration

The framework supports a few useful environment variables:

- `BASE_URL`: target application URL, defaults to `https://demoblaze.com/`
- `HEADLESS`: set to `false` to run headed browser mode in Cucumber
- `SLOW_MO_MS`: adds Playwright slow motion for debugging
- `CUCUMBER_STEP_TIMEOUT_MS`: overrides the default Cucumber step timeout

Examples:

```bash
set HEADLESS=false&& npm run test:cucumber
set SLOW_MO_MS=1000&& npm run test:cucumber:auth
set BASE_URL=https://demoblaze.com/&& npm run test:cucumber
```