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

Set in `.env` (gitignored; copy `.env.example`). `config/env.js` loads and
validates it once and exports a single `env` object — read config from there,
not from `process.env`, in new code. Real environment variables override `.env`.

| Variable | Default | Purpose |
|---|---|---|
| `BASE_URL` | `https://demoblaze.com/` | Target environment |
| `DEMOBLAZE_USERNAME` | — | Persistent account for `getEnvCredentials()` |
| `DEMOBLAZE_PASSWORD` | — | Persistent account for `getEnvCredentials()` |
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
  env.js              # .env loader + validated config object (single source of truth)
  credentials.js      # Persistent account credentials, sourced from .env
reports/
  scripts/            # Allure orchestration and AI debug scripts
```

## Conventions

- **Selectors belong in page objects** — step definitions call POM methods only, never build locator chains inline
- **Steps describe behavior** — `LoginPage.login()` not `page.locator('#loginusername').fill(...)`
- **Generated credentials per scenario** — unique username per run to avoid state conflicts; use `getEnvCredentials()` only when a flow needs a login that persists between runs
- **Config through `config/env.js`** — no new `process.env` reads scattered across the framework
- **Role-based locators preferred** — `getByRole()` first, then stable IDs, then scoped text

## Test Tags

- `@smoke` — 5 happy-path scenarios, run on every push
- `@regression` — all 29 scenarios (the 3 `Categories load correct products` examples count separately)

## CI

`.github/workflows/playwright.yml` runs the smoke suite and uploads the Allure report.

- **Triggers on a push to any branch** (`branches: ['**']`), so feature branches get CI before a PR exists. Also runs on `workflow_dispatch` for manual re-runs.
- The `pull_request` trigger exists only for fork PRs; the job's `if` skips same-repo PRs so a commit never runs twice. A same-repo PR's checks come from its push run, which is attached to the same head SHA.
- `concurrency` supersedes an in-flight run when the same branch is pushed again. The key includes `github.event_name` so a `pull_request` run cannot cancel its paired push run.

## Known Issues

- **`playwright.config.js` is not used** — the Cucumber runner ignores it. It now reads `config/env.js` rather than hardcoding `headless: false` / `slowMo: 3000`, so it would no longer break CI, but nothing executes it.
- **Modal assertion text** — `site-modals.steps.js` expects `"Thanks for the message!!"` (single-s), matching the current live Demoblaze alert text. This previously read as a double-s typo that was said to match the site; re-verified against the live site on 2026-09-08 and it does not — update this note again if the site's wording changes.
- **Only Chromium enabled** — no cross-browser or mobile viewport coverage.
- **No CI account configured** — CI has no `DEMOBLAZE_USERNAME`/`DEMOBLAZE_PASSWORD` secrets, so any scenario using `getEnvCredentials()` will fail there until they are added to the workflow environment.

### Live-site defects found 2026-09-13 (tests work around these, do not "fix" the workarounds)

- **Duplicate DOM id on `cart.html` / `prod.html`** — the About us modal heading carries `id="logInModalLabel"` (and `#videoModalLabel` is absent on those pages). A bare `#logInModalLabel` is therefore ambiguous in Playwright strict mode, so `LoginPage` scopes its login-modal locators to `#logInModal`. Do not un-scope them.
- **SweetAlert OK ignores early clicks** — the purchase confirmation only binds its confirm handler once `.sweet-alert` gains the `visible` class (~600ms after the title renders). Clicking OK before that is silently ignored and no redirect happens, so `CheckoutPage.acknowledgeConfirmation()` waits for that class first.
- **`index.html` never reaches the `load` state**, and `/entries` is often served from cache on the post-purchase redirect. Wait on the URL (`waitUntil: 'domcontentloaded'`), not on `load`, `networkidle`, or the `/entries` response.
- **Pagination `Previous` is off by one** — after Next→Previous, page 1 renders shifted by one product and pulls in a page-2 item. No test asserts Previous returns to the original page 1, because that would correctly fail.
- **Confirmation date uses a 0-indexed month** — rendered `Date: 12/8/2026` on 2026-09-12. Assertions deliberately avoid the `Date:` field.
- **`/viewcart` returns every cart row for every user on the site** (~186KB) and the page filters client-side by cookie. Rows therefore render *after* the response resolves, so an "is empty" assertion can pass against a table that has not rendered yet — see the note on `CartPage.expectEmpty()`.
- **The Contact modal has no validation** — a completely blank submission still returns `"Thanks for the message!!"`. Untested on purpose; asserting it would enshrine a defect.

## Resolved Issues (kept for history)

- ~~CI runs the wrong runner~~ — fixed 2026-09-12: `.github/workflows/playwright.yml` now runs `npm run test:cucumber:smoke` and uploads the generated `reports/allure-report/` instead of running `npx playwright test`.
- ~~`npm ci` failed in CI~~ — fixed 2026-09-12: `package-lock.json` was gitignored, so `npm ci` had nothing to install from. It's now committed.
- ~~`config/credentials.js` held hardcoded plaintext credentials~~ — fixed 2026-09-12: credentials now come from `.env` via `config/env.js`; `.env` is gitignored and `.env.example` is the committed template.
- ~~`tests/API/api.test.js`~~ — removed 2026-09-12: unused placeholder pointing at `api.example.com`; was the only thing the old `npx playwright test` runner ever executed.
