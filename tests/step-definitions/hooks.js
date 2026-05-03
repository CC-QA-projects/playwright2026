import { After, Before, Status, setDefaultTimeout } from '@cucumber/cucumber';

const SCENARIO_LOGS_ENABLED = process.env.CUCUMBER_SCENARIO_LOGS !== 'false';

function formatDuration(milliseconds) {
  if (!Number.isFinite(milliseconds) || milliseconds < 1000) {
    return `${milliseconds ?? 0}ms`;
  }

  return `${(milliseconds / 1000).toFixed(1)}s`;
}

function formatScenarioLabel(pickle, gherkinDocument) {
  const featureName = gherkinDocument?.feature?.name ?? pickle?.uri ?? 'Unknown feature';
  const scenarioName = pickle?.name ?? 'Unknown scenario';

  return `${featureName} :: ${scenarioName}`;
}

function formatScenarioStatus(status) {
  switch (status) {
    case Status.PASSED:
      return 'PASS';
    case Status.FAILED:
      return 'FAIL';
    case Status.SKIPPED:
      return 'SKIP';
    case Status.PENDING:
      return 'PENDING';
    case Status.UNDEFINED:
      return 'UNDEFINED';
    case Status.AMBIGUOUS:
      return 'AMBIGUOUS';
    default:
      return String(status ?? 'UNKNOWN').toUpperCase();
  }
}

function formatFailureSummary(result) {
  if (typeof result?.message === 'string' && result.message.trim()) {
    return result.message.trim();
  }

  if (typeof result?.exception?.message === 'string' && result.exception.message.trim()) {
    return result.exception.message.trim();
  }

  if (typeof result?.exception?.stackTrace === 'string' && result.exception.stackTrace.trim()) {
    return result.exception.stackTrace.trim();
  }

  return '';
}

setDefaultTimeout(Number(process.env.CUCUMBER_STEP_TIMEOUT_MS ?? '30000'));

Before(function ({ pickle, gherkinDocument }) {
  this.scenarioStartedAt = Date.now();
  this.currentScenarioLabel = formatScenarioLabel(pickle, gherkinDocument);
});

After(async function (scenario) {
  const duration = this.scenarioStartedAt ? Date.now() - this.scenarioStartedAt : undefined;

  if (SCENARIO_LOGS_ENABLED) {
    const status = formatScenarioStatus(scenario.result?.status);
    const label = this.currentScenarioLabel ?? 'Unknown scenario';
    const timing = duration === undefined ? '' : ` (${formatDuration(duration)})`;

    if (scenario.result?.status === Status.FAILED) {
      const failureSummary = formatFailureSummary(scenario.result);

      console.error(
        failureSummary
          ? `[${status}] ${label}${timing}\n${failureSummary}`
          : `[${status}] ${label}${timing}`
      );
    } else {
      console.log(`[${status}] ${label}${timing}`);
    }
  }

  if (scenario.result?.status === Status.FAILED && this.page) {
    const screenshot = await this.page.screenshot({ fullPage: true });
    await this.attach(screenshot, 'image/png');
  }

  if (this.browser) {
    await this.browser.close();
    this.browser = undefined;
  }
});
