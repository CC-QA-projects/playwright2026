import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, '..', '..');
const ALLURE_REPORT_DIR = path.join(ROOT_DIR, 'reports', 'allure-report');
const TEST_CASES_DIR = path.join(ALLURE_REPORT_DIR, 'data', 'test-cases');
const ATTACHMENTS_DIR = path.join(ALLURE_REPORT_DIR, 'data', 'attachments');
const OUTPUT_DIR = path.join(ROOT_DIR, 'reports', 'ai-debug');
const OUTPUT_MARKDOWN_PATH = path.join(OUTPUT_DIR, 'latest.md');
const OUTPUT_JSON_PATH = path.join(OUTPUT_DIR, 'latest.json');
const DEFAULT_MODEL = process.env.AI_DEBUG_MODEL ?? 'gpt-4.1-mini';
const MAX_FAILURES = Number(process.env.AI_DEBUG_MAX_FAILURES ?? '5');
const OPENAI_BASE_URL = (
  process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1'
).replace(/\/+$/u, '');

function normalizeForDisplay(filePath) {
  return path.relative(ROOT_DIR, filePath).split(path.sep).join('/');
}

function safeReadFile(filePath) {
  try {
    return readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function ensureDirectory(directoryPath) {
  mkdirSync(directoryPath, { recursive: true });
}

function listJsonFiles(directoryPath) {
  if (!existsSync(directoryPath)) {
    return [];
  }

  return readdirSync(directoryPath)
    .filter((entry) => entry.endsWith('.json'))
    .map((entry) => path.join(directoryPath, entry))
    .sort((left, right) => statSync(right).mtimeMs - statSync(left).mtimeMs);
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function collectAllureCases() {
  return listJsonFiles(TEST_CASES_DIR)
    .map((filePath) => ({
      filePath,
      data: readJson(filePath),
    }))
    .filter((entry) => entry.data);
}

function isFailedStatus(status) {
  return status === 'failed' || status === 'broken';
}

function getRetryCount(testCase) {
  return testCase.retriesCount ?? testCase.extra?.retries?.length ?? 0;
}

function deduplicateFailures(testCases) {
  const latestByKey = new Map();

  for (const testCase of testCases) {
    const key =
      testCase.historyId ??
      testCase.fullName ??
      `${testCase.name ?? 'unknown'}:${testCase.labels?.find((label) => label.name === 'feature')?.value ?? 'unknown'}`;
    const existing = latestByKey.get(key);

    if (!existing || shouldPreferTestCase(testCase, existing)) {
      latestByKey.set(key, testCase);
    }
  }

  return [...latestByKey.values()];
}

function shouldPreferTestCase(candidate, current) {
  const candidateRetries = getRetryCount(candidate);
  const currentRetries = getRetryCount(current);

  if (candidateRetries !== currentRetries) {
    return candidateRetries > currentRetries;
  }

  return (candidate.time?.start ?? 0) > (current.time?.start ?? 0);
}

function flattenSteps(steps = []) {
  return steps.flatMap((step) => [step, ...flattenSteps(step.steps ?? [])]);
}

function flattenAttachmentsFromStage(stage) {
  if (!stage) {
    return [];
  }

  const stageAttachments = stage.attachments ?? [];
  const stepAttachments = flattenSteps(stage.steps ?? []).flatMap((step) => step.attachments ?? []);
  return [...stageAttachments, ...stepAttachments];
}

function collectAttachments(testCase) {
  const testStageAttachments = flattenAttachmentsFromStage(testCase.testStage);
  const beforeAttachments = (testCase.beforeStages ?? []).flatMap(flattenAttachmentsFromStage);
  const afterAttachments = (testCase.afterStages ?? []).flatMap(flattenAttachmentsFromStage);

  return [...testStageAttachments, ...beforeAttachments, ...afterAttachments];
}

function extractFailedStep(testCase) {
  const allSteps = flattenSteps(testCase.testStage?.steps ?? []);
  return allSteps.find((step) => isFailedStatus(step.status));
}

function extractFeatureFile(testCase) {
  const fullName = testCase.fullName ?? '';
  const match = fullName.match(/^([^#]+)#/u);

  if (!match) {
    return null;
  }

  const featurePath = path.join(ROOT_DIR, match[1]);
  return existsSync(featurePath) ? featurePath : null;
}

function parseStackReferences(text) {
  if (typeof text !== 'string' || !text.trim()) {
    return [];
  }

  const references = [];
  const seen = new Set();
  const fileUrlPattern = /file:\/\/\/([A-Za-z]:\/[^\s)]+?):(\d+):(\d+)/gu;
  const windowsPathPattern = /([A-Za-z]:\\[^\n\r]+?\.[a-zA-Z0-9]+):(\d+):(\d+)/gu;

  for (const match of text.matchAll(fileUrlPattern)) {
    const decodedPath = path.normalize(decodeURIComponent(match[1]));
    const normalizedPath = decodedPath.replace(/\//gu, path.sep);
    addReference(normalizedPath, match[2], match[3]);
  }

  for (const match of text.matchAll(windowsPathPattern)) {
    addReference(path.normalize(match[1]), match[2], match[3]);
  }

  return references;

  function addReference(filePath, line, column) {
    if (
      !filePath.startsWith(ROOT_DIR) ||
      filePath.includes(`${path.sep}node_modules${path.sep}`) ||
      !existsSync(filePath)
    ) {
      return;
    }

    const key = `${filePath}:${line}:${column}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    references.push({
      filePath,
      relativePath: normalizeForDisplay(filePath),
      line: Number(line),
      column: Number(column),
    });
  }
}

function createCodeFrame(filePath, targetLine, contextLines = 4) {
  const content = safeReadFile(filePath);

  if (!content) {
    return '';
  }

  const lines = content.split(/\r?\n/u);
  const start = Math.max(1, targetLine - contextLines);
  const end = Math.min(lines.length, targetLine + contextLines);

  return lines
    .slice(start - 1, end)
    .map((line, index) => {
      const lineNumber = start + index;
      const marker = lineNumber === targetLine ? '>' : ' ';
      return `${marker}${String(lineNumber).padStart(4, ' ')}| ${line}`;
    })
    .join('\n');
}

function summarizeHeuristically(failure) {
  const combinedText = [
    failure.statusMessage,
    failure.statusTrace,
    failure.failedStep?.name,
  ]
    .filter(Boolean)
    .join('\n')
    .toLowerCase();

  let classification = 'unclear';
  let confidence = 'medium';
  let rootCause = 'The failure needs manual review.';
  let nextStep = 'Inspect the linked stack-reference files and screenshot.';

  if (combinedText.includes('expect(received)')) {
    classification = 'test assertion bug';
    confidence = 'high';
    rootCause = 'The scenario assertion does not match the actual application output.';
    nextStep = 'Compare the expected value in the step definition with the real value returned by the page.';
  } else if (
    combinedText.includes('timeout') ||
    combinedText.includes('waiting for') ||
    combinedText.includes('to be visible')
  ) {
    classification = 'timing or wait issue';
    confidence = 'medium';
    rootCause = 'The test likely asserted before the UI reached the expected state.';
    nextStep = 'Review waits, modal transitions, and whether the page object should wait for a stable UI state.';
  } else if (combinedText.includes('locator') || combinedText.includes('strict mode violation')) {
    classification = 'locator issue';
    confidence = 'high';
    rootCause = 'The selected element is missing, ambiguous, or unstable.';
    nextStep = 'Review the locator in the referenced page object and prefer resilient role/text/data-testid selectors.';
  } else if (combinedText.includes('net::') || combinedText.includes('econn') || combinedText.includes('fetch')) {
    classification = 'environment or network issue';
    confidence = 'medium';
    rootCause = 'The failure looks external to the assertion logic and may be caused by connectivity or environment setup.';
    nextStep = 'Check target availability, environment configuration, and any dependent services.';
  }

  const filesToInspect = failure.references.length > 0
    ? failure.references.map((reference) => `\`${reference.relativePath}\``).join(', ')
    : failure.featureFile
      ? `\`${failure.featureFile.relativePath}\``
      : 'No direct file references found';

  return [
    `## Classification`,
    `- Type: ${classification}`,
    `- Confidence: ${confidence}`,
    '',
    `## Likely Root Cause`,
    rootCause,
    '',
    `## Evidence`,
    `- Failed step: ${failure.failedStep?.name ?? 'Unknown'}`,
    `- Message: ${truncateText(failure.statusMessage || failure.statusTrace || 'No failure text available', 400)}`,
    '',
    `## Files To Inspect`,
    filesToInspect,
    '',
    `## Recommended Next Step`,
    nextStep,
  ].join('\n');
}

function truncateText(text, maxLength) {
  if (typeof text !== 'string') {
    return '';
  }

  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 3)}...`;
}

function buildPrompt(failure) {
  const screenshotList = failure.screenshots.length > 0
    ? failure.screenshots.map((filePath) => `- ${filePath}`).join('\n')
    : '- None attached';
  const codeReferences = failure.references.length > 0
    ? failure.references
        .map(
          (reference) => [
            `File: ${reference.relativePath}:${reference.line}:${reference.column}`,
            '```text',
            reference.codeFrame || 'Code frame unavailable',
            '```',
          ].join('\n')
        )
        .join('\n\n')
    : 'No stack references mapped back into the repository.';

  return [
    'You are debugging a Playwright + Cucumber + Allure automation failure.',
    'Return concise markdown with these exact sections:',
    '## Classification',
    '## Likely Root Cause',
    '## Evidence',
    '## Files To Inspect',
    '## Recommended Next Step',
    '',
    'Classify the issue as one of:',
    '- test assertion bug',
    '- locator issue',
    '- timing or wait issue',
    '- app behavior regression',
    '- environment or test data issue',
    '',
    'Treat the Allure failure output as the source of truth. The current repository files are only supporting context and may already have changed since the failing run.',
    '',
    'Focus on the most likely explanation, be evidence-based, and keep the response under 250 words.',
    '',
    `Scenario: ${failure.name}`,
    `Full name: ${failure.fullName ?? 'Unknown'}`,
    `Status: ${failure.status}`,
    `Feature label: ${failure.featureLabel ?? 'Unknown'}`,
    `Tags: ${failure.tags.length > 0 ? failure.tags.join(', ') : 'None'}`,
    `Duration: ${failure.durationMs ?? 'Unknown'}ms`,
    `Failed step: ${failure.failedStep?.name ?? 'Unknown'}`,
    `Retries: ${failure.retryCount}`,
    '',
    'Status message:',
    '```text',
    failure.statusMessage || 'None',
    '```',
    '',
    'Status trace:',
    '```text',
    failure.statusTrace || 'None',
    '```',
    '',
    'Screenshots:',
    screenshotList,
    '',
    'Repository code references:',
    codeReferences,
  ].join('\n');
}

async function requestAiDiagnosis(failure) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      mode: 'heuristic',
      content: summarizeHeuristically(failure),
    };
  }

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert Playwright, Cucumber, and test automation debugging assistant.',
        },
        {
          role: 'user',
          content: buildPrompt(failure),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      mode: 'heuristic',
      content: `${summarizeHeuristically(failure)}\n\n## AI Fallback Notice\nOpenAI request failed: ${truncateText(errorText, 500)}`,
    };
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content?.trim();

  return {
    mode: 'ai',
    content: content || summarizeHeuristically(failure),
  };
}

function enrichFailure(testCase) {
  const attachments = collectAttachments(testCase);
  const screenshots = attachments
    .filter((attachment) => typeof attachment?.source === 'string' && attachment.type?.startsWith('image/'))
    .map((attachment) => path.join(ATTACHMENTS_DIR, attachment.source))
    .filter((filePath) => existsSync(filePath))
    .map((filePath) => normalizeForDisplay(filePath));
  const references = parseStackReferences(`${testCase.statusMessage ?? ''}\n${testCase.statusTrace ?? ''}`).map(
    (reference) => ({
      ...reference,
      codeFrame: createCodeFrame(reference.filePath, reference.line),
    })
  );
  const featureFilePath = extractFeatureFile(testCase);

  return {
    uid: testCase.uid,
    name: testCase.name,
    fullName: testCase.fullName,
    status: testCase.status,
    statusMessage: testCase.statusMessage ?? '',
    statusTrace: testCase.statusTrace ?? '',
    durationMs: testCase.time?.duration,
    featureLabel: testCase.labels?.find((label) => label.name === 'feature')?.value ?? null,
    tags: (testCase.labels ?? [])
      .filter((label) => label.name === 'tag')
      .map((label) => label.value),
    failedStep: extractFailedStep(testCase),
    screenshots,
    attachmentsCount: attachments.length,
    retryCount: getRetryCount(testCase),
    references,
    featureFile: featureFilePath
      ? {
          filePath: featureFilePath,
          relativePath: normalizeForDisplay(featureFilePath),
        }
      : null,
  };
}

function createMarkdownReport(report) {
  const intro = [
    '# Allure AI Debug Report',
    '',
    `- Generated: ${report.generatedAt}`,
    `- Analyzer mode: ${report.mode}`,
    `- Failures analyzed: ${report.failures.length}`,
  ];

  if (report.failures.length === 0) {
    return [...intro, '', 'No failed or broken Allure test cases were found.'].join('\n');
  }

  const failureSections = report.failures.map((failure, index) => {
    const metadata = [
      `## ${index + 1}. ${failure.name}`,
      '',
      `- Status: ${failure.status}`,
      `- Feature: ${failure.featureLabel ?? 'Unknown'}`,
      `- Failed step: ${failure.failedStep?.name ?? 'Unknown'}`,
      `- Feature file: ${failure.featureFile ? `\`${failure.featureFile.relativePath}\`` : 'Not mapped'}`,
      `- Stack references: ${
        failure.references.length > 0
          ? failure.references
              .map((reference) => `\`${reference.relativePath}:${reference.line}\``)
              .join(', ')
          : 'None mapped'
      }`,
      `- Screenshots: ${
        failure.screenshots.length > 0
          ? failure.screenshots.map((filePath) => `\`${filePath}\``).join(', ')
          : 'None attached'
      }`,
      '',
      '### Failure Output',
      '```text',
      failure.statusMessage || failure.statusTrace || 'No failure text available',
      '```',
      '',
      '### Diagnosis',
      failure.analysis,
    ];

    return metadata.join('\n');
  });

  return [...intro, '', ...failureSections].join('\n');
}

async function main() {
  ensureDirectory(OUTPUT_DIR);

  const allCases = collectAllureCases();
  const failedCases = deduplicateFailures(
    allCases
      .map((entry) => entry.data)
      .filter((testCase) => isFailedStatus(testCase.status))
  )
    .slice(0, Number.isFinite(MAX_FAILURES) && MAX_FAILURES > 0 ? MAX_FAILURES : 5)
    .map(enrichFailure);

  const analyses = [];
  for (const failure of failedCases) {
    const analysis = await requestAiDiagnosis(failure);
    analyses.push({
      ...failure,
      analysis: analysis.content,
      analysisMode: analysis.mode,
    });
  }

  const mode = analyses.some((failure) => failure.analysisMode === 'ai') ? 'ai' : 'heuristic';
  const report = {
    generatedAt: new Date().toISOString(),
    mode,
    failures: analyses,
  };

  writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(report, null, 2));
  writeFileSync(OUTPUT_MARKDOWN_PATH, createMarkdownReport(report));

  if (allCases.length === 0) {
    console.log(`No Allure test-case JSON files found under ${normalizeForDisplay(TEST_CASES_DIR)}.`);
    console.log(`Wrote empty AI debug reports to ${normalizeForDisplay(OUTPUT_DIR)}.`);
    return;
  }

  if (analyses.length === 0) {
    console.log('No failed or broken Allure test cases found.');
    console.log(`Wrote AI debug report to ${normalizeForDisplay(OUTPUT_MARKDOWN_PATH)}.`);
    return;
  }

  console.log(
    `Analyzed ${analyses.length} failed Allure case(s) in ${mode} mode. Report: ${normalizeForDisplay(
      OUTPUT_MARKDOWN_PATH
    )}`
  );
}

await main();
