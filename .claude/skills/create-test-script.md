# create-test-script

Create a new Gherkin scenario and all supporting code (step definitions, page object methods) for the Demoblaze Playwright/Cucumber framework. Follows all framework conventions and maximises step reuse — and where reuse isn't a clean fit, prefers refactoring existing code over duplicating it — before generating anything new.

**This skill is a two-phase process.** Phase 1 (research + report) always runs first and ends with a report awaiting your explicit go-ahead. Phase 2 (implementation) only runs after you approve — either as-is or with changes. Never skip straight to writing files.

## When to invoke

`/create-test-script <plain-English description of what to test>`

Example: `/create-test-script user can navigate to the laptops category and view a product`

---

## Phase 1 — Research and report (no files written)

### 1. Understand the request

Parse the user's description. Identify:
- The **feature area** (auth, cart, catalog, checkout, modals, or new)
- The **user action** being tested
- The **expected outcome**

If the description is ambiguous, ask one clarifying question before proceeding.

### 2. Audit existing steps and page objects (REQUIRED before writing anything)

Read every step definition file and the page objects they call:
- `tests/step-definitions/login.steps.js` → `tests/pages/LoginPage.js`
- `tests/step-definitions/add-items-to-cart.steps.js` → `tests/pages/HomePage.js`, `tests/pages/CartPage.js`
- `tests/step-definitions/catalog.steps.js` → `tests/pages/HomePage.js`, `tests/pages/ProductPage.js`
- `tests/step-definitions/checkout.steps.js` → `tests/pages/CheckoutPage.js`, `tests/pages/CartPage.js`
- `tests/step-definitions/site-modals.steps.js` → `tests/pages/CommonModalsPage.js`

For every piece of behaviour the new scenario needs, classify it into exactly one bucket:

- **Reused** — an existing step (and underlying page object method) already does this exactly. No code changes.
- **Refactor** — an existing step or method is close but not quite a fit: it's hardcoded to a specific value, too narrowly named, or duplicates logic the new scenario also needs. Generalizing/parameterizing it serves both the existing callers and the new scenario without duplicating logic.
- **New** — no existing step or method covers this behaviour, and generalizing something existing wouldn't make sense.

**Catalog of currently reusable steps (check against this list first, then re-verify against the actual files above — the list may drift from the code):**

**Given (setup)**
- `I am on the Demoblaze home page` — launch browser, navigate, init all page objects
- `I have {string} in the cart` — opens home, adds single product to cart
- `I have {string} and {string} in the cart` — opens home, adds two products to cart

**When (actions)**
- `I sign up with a generated Demoblaze account`
- `I try to sign up again with the same generated Demoblaze account`
- `I log in with the generated Demoblaze credentials`
- `I log in with the configured Demoblaze credentials` — uses the persistent `.env` account; only for flows that need a login surviving between runs
- `I attempt to log in with the generated username and an invalid password`
- `I attempt to log in with the username {string} and password {string}` — pass `""` for blank-field validation
- `I attempt to sign up with the username {string} and password {string}` — pass `""` for blank-field validation
- `I log out of Demoblaze`
- `I open the cart` — safe to call from anywhere, including cart.html itself
- `I add the open product to the cart` — from a product page; records the displayed price for later comparison
- `I return to the home page from the navbar`
- `I go to the next page of products`
- `I acknowledge the purchase confirmation` — clicks OK and waits for the redirect home
- `I attempt to place an order with blank name and card`
- `I add {string} from the {string} category to the cart` — navigates category → product → adds to cart → opens cart
- `I add {string} to the cart 2 times`
- `I remove {string} from the cart`
- `I view the {string} category`
- `I open the {string} product page`
- `I open the place order modal`
- `I place an order for:` — accepts a data table with keys: name, country, city, card, month, year
- `I send a contact message through the Contact modal`
- `I open the About us modal`
- `I click Next on the carousel`
- `I click Previous on the carousel`

**Then (assertions)**
- `I should see a signup success alert`
- `I should see a duplicate signup alert`
- `I should see my generated welcome username`
- `I should see a login error alert saying {string}`
- `I should not see a welcome username`
- `I should see the Log in link and not the Log out link`
- `I should see {string} in the cart`
- `I should not see {string} in the cart`
- `I should still see {string} in the cart`
- `the cart total should equal {int}`
- `the cart total should equal the sum of item prices`
- `the cart total should be price x2 for {string}`
- `I should see the main navbar elements`
- `I should see the product {string} in the product list`
- `I should see the {string} product details`
- `I should see the Second slide image`
- `I should see the First slide image`
- `the order modal total should be {int}`
- `I should see the purchase confirmation`
- `the purchase confirmation should include {string}`
- `I should see a contact success alert`
- `I should see the About us modal content`
- `I should see a signup error alert saying {string}`
- `I should see an order error alert saying {string}`
- `the place order modal should still be open`
- `the cart should be empty` — weak on its own (see `CartPage.expectEmpty()`); pair with an absence assertion where an item was present beforehand
- `the cart price for {string} should equal its product page price`
- `I should see {int} products in the product list`
- `I should not see the product {string} in the product list`
- `the next page button should be hidden`

### 3. Verify locators and behaviour against the live site (ALWAYS — never assume)

Do this for every new or refactored interaction point, even when an existing page object already appears to cover it — the site may have changed since that code was written, and stale assumptions produce flaky tests.

Demoblaze is a JS-rendered SPA, so a plain HTTP fetch will not show rendered content, dialogs, or async-loaded state. Verify by driving a real headless browser:

1. Write a short throwaway script in the OS scratchpad directory (never inside the repo) that launches Chromium via Playwright, navigates the exact flow the scenario needs, and logs the actual roles/text/attributes of the elements involved (accessible name, tag, id, any relevant network calls like `/bycat`, `/entries`, `/viewcart`).
2. Run it with `node <script>.mjs` from the project root (so it resolves `node_modules`).
3. Delete the throwaway script when done.

From what you observe, pick the locator using this priority order:
1. `getByRole()` — semantic, most resilient
2. `getByLabel()` / `getByPlaceholder()` — form fields
3. `getByText()` — visible text
4. Stable `id` attribute — only if above are not available
5. CSS class or nth-child — last resort only

Never use XPath. Never build multi-step locator chains inside step definitions. Note anywhere the live site's actual behaviour contradicts what an existing page object assumes (e.g. a modal that doesn't auto-close, an async render that isn't waited for) — that's a refactor candidate, not something to work around silently.

### 4. Design the Gherkin scenario (draft)

Write a draft Gherkin scenario using the audit + verification results:
- Reuse existing steps wherever they fit exactly
- Only invent new step text when no existing step covers the behaviour, and refactoring an existing one isn't a better fit
- Follow BDD naming conventions:
  - `Given` → precondition / setup state
  - `When` → user action
  - `Then` → observable outcome / assertion
  - `And` / `But` → continuation of previous keyword
- Use `{string}` parameters for variable data (quoted in feature file)
- Use `{int}` for numeric values
- Use data tables (`| key | value |`) for multi-field forms
- Tag with `@regression` (always) and `@smoke` (only if it is a critical happy path)
- Match the existing feature file if adding to one, or propose a new feature file following the same structure

### 5. Map target files

Determine where each piece of code would go if approved:

| New step type | Where to add the step def | Where to add page object method |
|---|---|---|
| Auth/login/signup | `login.steps.js` | `LoginPage.js` |
| Cart actions | `add-items-to-cart.steps.js` | `HomePage.js` or `CartPage.js` |
| Catalog/browsing | `catalog.steps.js` | `HomePage.js` or `ProductPage.js` |
| Checkout/order | `checkout.steps.js` | `CheckoutPage.js` or `CartPage.js` |
| Modals/contact | `site-modals.steps.js` | `CommonModalsPage.js` |

### 6. Write and deliver the report — then STOP

Do not write, edit, or create any repo files in this phase. Deliver the report below in the chat and wait for the user's go-ahead (approval as-is, or requested changes) before touching any files.

```markdown
# Create-Test Report: <short scenario title>

## Summary
<2-4 sentences: what the scenario tests, why, and the overall shape of the change
(mostly reuse / needs some refactoring / mostly new code).>

## Reused Steps
No code changes — used exactly as they exist today.

| Step text | File |
|---|---|
| ... | ... |

## Refactor Steps
Existing step(s)/method(s) that need to change to cleanly support this scenario
without duplicating logic.

### <existing step or method name>
- **Current behaviour**: ...
- **Proposed change**: ...
- **Why reuse-as-is isn't enough**: ...
- **Impact**: which existing feature files/scenarios call this today, and confirmation
  the refactor is backward compatible (existing scenarios must still pass unchanged)

## Newly Created Steps
No existing equivalent, and generalizing something existing wouldn't make sense.

### <new step text>
- **File location**: step def file + page object file/method
- **Locator(s)**: exact locator, priority tier used, and why — sourced from the live
  site verification in step 3, not assumption
- **Impact**: new code surface only, no existing behaviour touched

## Proposed Feature File
​```gherkin
<full scenario as it would be written>
​```

## Site Verification Notes
What was checked live at https://demoblaze.com/, what was confirmed vs. what turned
out to differ from existing code's assumptions, and any surprises worth flagging.

## Go-ahead needed
No files have been written. Reply to approve as-is, or request changes, before I
implement anything.
```

---

## Phase 2 — Implementation (only after explicit user go-ahead)

Implement exactly what the approved report described (or the user's requested adjustments to it). Do not introduce scope beyond what was reported.

### 7. Apply refactors first

For each item in the report's **Refactor Steps** section, update the existing step definition/page object method. After refactoring, mentally re-check (or actually run) every existing scenario that calls it to confirm the change is backward compatible.

### 8. Write new page object methods

Add new methods to the appropriate page object per the report. Rules:
- All locators go in the constructor as `this.locatorName = page.getBy...`
- All interactions are async methods
- Methods return values only when the caller needs data (dialog messages, counts, prices)
- Assertions use `expect()` from `@playwright/test` inside the page object method
- Dialog captures use `this.captureDialogMessage(() => ...)` from `BasePage`
- Never put `page.locator(...)` chains inside step definitions

### 9. Write new step definitions

Add new step definitions to the appropriate step file. Rules:
- `Given` / `When` / `Then` are imported from `@cucumber/cucumber`
- `expect` is imported from `@playwright/test` only when the step itself makes an assertion (prefer delegating assertions to the page object)
- Page objects are available as `this.homePage`, `this.loginPage`, `this.cartPage`, `this.checkoutPage`, `this.commonModalsPage`, `this.productPage`
- Dialog message is stored on `this.lastDialogMessage`
- Generated credentials are accessed via `getGeneratedCredentials(this)` from `app-context.js`; the persistent `.env` account via `getEnvCredentials()` from `config/credentials.js`
- Config values (base URL, timeouts, headless) come from the `env` object in `config/env.js` — never read `process.env` directly
- Never call `page.locator()`, `page.getByRole()`, etc. directly in a step definition

### 10. Add new products to test-data.js (if needed)

If a new product is referenced that isn't already in the category map, add it to `tests/step-definitions/helpers/test-data.js`:

```javascript
const productCategories = {
  'Iphone 6 32gb': 'Phones',
  'Samsung galaxy s6': 'Phones',
  'Sony vaio i5': 'Laptops',
  'Apple monitor 24': 'Monitors',
  // add new product here
};
```

### 11. Write the feature file

Commit the approved scenario to the target feature file, matching existing formatting and tagging.

### 12. Confirm completion

Run the new/affected scenario (and, if a refactor touched shared code, the broader regression suite) before reporting done. Report back briefly:
- Files created/modified
- Test run result
- Anything that changed from the approved report during implementation, and why

---

## Framework conventions (always enforce)

- ES modules (`import`/`export`) — no CommonJS `require()`
- Plain `.js` files only — no TypeScript
- No comments unless the WHY is non-obvious
- `BasePage.captureDialogMessage()` for any browser dialog interaction
- `expect.poll()` for assertions on values that update asynchronously (cart totals)
- `openDemoblazeHomePage(world)` launches the browser; it is called once per scenario via `Given I am on the Demoblaze home page` or the two-product Given steps
- Never use `page.waitForTimeout()` — use role/text locators and network-aware waits (e.g. `page.waitForResponse()` for Demoblaze's async `/bycat`, `/entries`, `/viewcart` calls) instead
- Scenario tags: `@regression` on every scenario, `@smoke` only on the 5 critical happy paths

## Product category map (for reference — re-verify against `test-data.js`, it may have grown)

| Product | Category |
|---|---|
| Iphone 6 32gb | Phones |
| Samsung galaxy s6 | Phones |
| Sony vaio i5 | Laptops |
| Apple monitor 24 | Monitors |
