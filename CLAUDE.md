# CLAUDE.md

## Project

BDD UI automation framework for [Demoblaze](https://demoblaze.com/), an e-commerce demo site. Built to demonstrate scalable test automation patterns.

## Tech Stack

- **Playwright** 1.56 — browser automation (Chromium only)
- **Cucumber.js** 11 — BDD with Gherkin feature files
- **Allure** — test reporting with failure screenshots
- **JavaScript** — ES modules throughout (no TypeScript)
- **Node.js** 18+

## Running Tests

```bash
# Smoke suite (5 critical scenarios)
npm run test:cucumber:smoke

# Full regression (15 scenarios)
npm run test:cucumber:regression

# Feature-specific
npm run test:cucumber:auth
npm run test:cucumber:cart
npm run test:cucumber:checkout
npm run test:cucumber:modals

# With Allure report
npm run test:cucumber:smoke:allure

# With Allure + AI failure diagnosis (requires OPENAI_API_KEY)
npm run test:cucumber:smoke:allure:ai
```

## Allure Reporting

```bash
npm run allure:generate   # build HTML report from results
npm run allure:open       # open report in browser
npm run allure:clean      # remove all Allure artifacts
```

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `BASE_URL` | `https://demoblaze.com/` | Target environment |
| `HEADLESS` | `true` | Run headed if set to `false` |
| `SLOW_MO_MS` | `0` | Delay between actions (ms) |
| `CUCUMBER_STEP_TIMEOUT_MS` | `30000` | Per-step timeout |
| `CUCUMBER_SCENARIO_LOGS` | `true` | Console scenario logging |
| `AI_DEBUG_ALLURE` | — | Set to `true` to auto-run AI analysis |
| `OPENAI_API_KEY` | — | Required for AI failure diagnosis |

## Project Structure

```
tests/
  features/           # Gherkin feature files
  pages/              # Page Object Model classes
  step-definitions/   # Cucumber step implementations
    helpers/
      app-context.js  # Browser launch + page object init (World object)
      hooks.js        # Before/After hooks, screenshots, teardown
config/
  credentials.js      # Static test credentials (not used in scenarios)
reports/
  scripts/            # Allure orchestration and AI debug scripts
```

## Conventions

- **Selectors belong in page objects** — step definitions call POM methods only, never build locator chains inline
- **Steps describe behavior** — `LoginPage.login()` not `page.locator('#loginusername').fill(...)`
- **Generated credentials per scenario** — unique username per run to avoid state conflicts
- **Role-based locators preferred** — `getByRole()` first, then stable IDs, then scoped text

## Test Tags

- `@smoke` — 5 happy-path scenarios, run on every push
- `@regression` — all 15 scenarios

## Known Issues

- **`playwright.config.js` is not used** — has `headless: false` and `slowMo: 3000` hardcoded; would break CI if it were used.
- **Modal assertion text** — `site-modals.steps.js` expects `"Thanks for the message!!"` (single-s), matching the current live Demoblaze alert text. This previously read as a double-s typo that was said to match the site; re-verified against the live site on 2026-09-08 and it does not — update this note again if the site's wording changes.
- **`config/credentials.js`** — hardcoded plaintext credentials in version control. Unused by scenarios (which generate credentials dynamically) but should not be committed with real credentials.
- **Only Chromium enabled** — no cross-browser or mobile viewport coverage.

## Resolved Issues (kept for history)

- ~~CI runs the wrong runner~~ — fixed 2026-09-12: `.github/workflows/playwright.yml` now runs `npm run test:cucumber:smoke` and uploads the generated `reports/allure-report/` instead of running `npx playwright test`.
- ~~`npm ci` failed in CI~~ — fixed 2026-09-12: `package-lock.json` was gitignored, so `npm ci` had nothing to install from. It's now committed.
- ~~`tests/API/api.test.js`~~ — removed 2026-09-12: unused placeholder pointing at `api.example.com`; was the only thing the old `npx playwright test` runner ever executed.
