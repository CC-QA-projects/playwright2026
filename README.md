# playwright2026

## UI Test Execution Flow (Cucumber -> Allure)

Use this order every time:
1. Run a Cucumber command (this executes tests and writes Allure raw results).
2. Open or generate the Allure report from those results.

Allure raw files are written to `reports/allure-results/`.
Generated HTML report is written to `reports/allure-report/`.

## Prerequisites

- Install dependencies once:
  - `npm install`

## Step 1: Run UI tests with Cucumber

Pick one command based on what you want to run:

- `npm run test:cucumber`
  - Runs all Cucumber feature files.

- `npm run test:cucumber:smoke`
  - Runs only scenarios tagged with `@smoke`.

- `npm run test:cucumber:regression`
  - Runs only scenarios tagged with `@regression`.

- `npm run test:cucumber:THISONE`
  - Runs only scenarios tagged with `@THISONE`.

- `npm run test:cucumber:THISONE:slow`
  - Same as above, but sets `SLOW_MO_MS=1000` so browser actions run slower for easier visual debugging.

- `npm run test:cucumber:login`
  - Runs only `tests/features/login.feature`.

During any Cucumber run, the Allure reporter collects test results automatically.

## Step 2: View Allure report

After running tests, choose one of these:

- `npm run allure:serve`
  - Starts a temporary local Allure server directly from `reports/allure-results/`.
  - Best for quick viewing right after execution.

- `npm run allure:generate`
  - Builds static HTML report files in `reports/allure-report/`.
  - Useful for archiving or sharing generated artifacts.

- `npm run allure:open`
  - Opens the already generated static report from `reports/allure-report/`.
  - Use this after `npm run allure:generate`.

## Typical examples

- Run one debug tag slowly, then open report quickly:
  - `npm run test:cucumber:THISONE:slow`
  - `npm run allure:serve`

- Run smoke suite, generate static report, then open it:
  - `npm run test:cucumber:smoke`
  - `npm run allure:generate`
  - `npm run allure:open`

## Notes

- Failed scenarios attach screenshots automatically via `tests/step-definitions/hooks.js`.
- If you want a clean report each run, delete old files in `reports/allure-results/` before running tests.