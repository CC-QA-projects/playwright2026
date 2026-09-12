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
- Optional AI-assisted debugging summary for failed Allure cases

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

Create your local configuration from the template:

```bash
copy .env.example .env
```

`.env` is gitignored. Fill in `BASE_URL` and, if you need a persistent login,
`DEMOBLAZE_USERNAME` / `DEMOBLAZE_PASSWORD`. See [Configuration](#configuration).

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
npm run test:cucumber:smoke:allure:ai
npm run test:cucumber:regression:allure
npm run test:cucumber:regression:allure:ai
npm run allure:debug
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

Generate an AI-assisted failure summary from the latest Allure report:

```bash
npm run allure:debug
```

Run smoke tests, generate Allure, and produce the AI summary automatically:

```bash
npm run test:cucumber:smoke:allure:ai
```

## Configuration

All configuration lives in `.env` (copied from `.env.example`) and is read and
validated once by `config/env.js`, which every runner imports. Real environment
variables take precedence over `.env`, so CI secrets and one-off command-line
overrides keep working.

| Variable | Default | Purpose |
|---|---|---|
| `BASE_URL` | `https://demoblaze.com/` | Target application URL |
| `DEMOBLAZE_USERNAME` | — | Persistent test account username |
| `DEMOBLAZE_PASSWORD` | — | Persistent test account password |
| `HEADLESS` | `true` | Set `false` to run headed |
| `SLOW_MO_MS` | `0` | Delay between browser actions, for debugging |
| `CUCUMBER_STEP_TIMEOUT_MS` | `30000` | Per-step timeout |
| `CUCUMBER_SCENARIO_LOGS` | `true` | Set `false` to disable live scenario logging |
| `AI_DEBUG_ALLURE` | `false` | Set `true` to auto-run the AI debug step after Allure generation |
| `OPENAI_API_KEY` | — | Enables model-based failure diagnosis |
| `AI_DEBUG_MODEL` | `gpt-4.1-mini` | Model used by the Allure debug script |
| `AI_DEBUG_MAX_FAILURES` | `5` | How many failed cases to analyze per run |

### Credentials

Two sources, used for different purposes:

- **Generated per scenario** — `getGeneratedCredentials(this)` from
  `app-context.js`. Default for authentication scenarios: a unique account per
  run, so nothing collides with previous runs.
- **Configured account** — `getEnvCredentials()` from `config/credentials.js`,
  backed by `DEMOBLAZE_USERNAME` / `DEMOBLAZE_PASSWORD`. For flows that need a
  login that survives between runs. Available in Gherkin as
  `When I log in with the configured Demoblaze credentials`. Throws a clear
  error if the variables are missing.

Windows examples (an inline variable overrides `.env` for that run):

```bash
set HEADLESS=false&& npm run test:cucumber
set SLOW_MO_MS=1000&& npm run test:cucumber:auth
set BASE_URL=https://demoblaze.com/&& npm run test:cucumber
```