import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  buildReport,
  finalState,
  normalizeSuites,
  redactSecrets,
  renderReportText,
  truncateSummary,
  writeReport,
} from './validation-report.mjs';
import { buildStatusPayload, payloadFromReport, resolveStatusSha, STATUS_CONTEXT } from './post-commit-status.mjs';

const REQUIRED_SUITE_INPUTS = [
  { category: 'unit', name: 'ci suite tests', status: 'passed', artifact: 'unit.log' },
  { category: 'integration', name: 'rspec', status: 'passed', artifact: 'integration.log' },
  { category: 'lint_ruby', name: 'Ruby lint', status: 'passed', artifact: 'lint-ruby.log' },
  { category: 'lint_eslint', name: 'JavaScript lint', status: 'passed', artifact: 'lint-eslint.log' },
  { category: 'lint_style', name: 'Styles lint', status: 'passed', artifact: 'lint-style.log' },
  { category: 'lint_factory', name: 'factory_bot lint', status: 'passed', artifact: 'lint-factory.log' },
  { category: 'integration_frontend', name: 'node tests', status: 'passed', artifact: 'frontend.log' },
];

const FIXED_HEADINGS = [
  'GALA CI',
  'state:',
  'commit_summary:',
  'run:',
  'pr_ref:',
  'run_url:',
  'commit_count:',
  'changeset:',
  'test_and_infra_matrix:',
  'sst_diff_mutation:',
  'docker_image_size:',
  'infrastructure_terms:',
  'release_gates:',
  'failure_links:',
  'failure_context:',
  'top_failure_lines:',
  'failure_locations:',
  'suite_artifacts:',
];

const BANNED_OUTPUT_TOKENS = [
  'ri' + 'sk',
  'out' + 'age',
  'confi' + 'dence',
  'release' + '_readiness',
  'evidence' + '_confi' + 'dence',
];

function baseInput(overrides = {}) {
  return {
    commitSummary: 'Make CI report objective',
    commitCount: 3,
    changeset: {
      summary: 'Make CI report objective',
      filesChanged: 4,
      additions: 120,
      deletions: 90,
    },
    runContext: {
      runId: '26745216631',
      runAttempt: '1',
      runUrl: 'https://github.com/galahq/gala/actions/runs/26745216631',
      eventName: 'pull_request',
      actor: 'papes1ns',
      prNumber: '785',
      headRef: 'infra/sst-aws-poc',
      baseRef: 'main',
      headSha: '998e5c9921aa04cd4876e3965a7a57300c40809d',
      baseSha: 'main-sha',
      repository: 'galahq/gala',
      artifactsUrl: 'https://github.com/galahq/gala/actions/runs/26745216631/artifacts',
    },
    contributors: [],
    suites: REQUIRED_SUITE_INPUTS,
    sstDiff: {
      status: 'passed',
      reason: '',
      summary: 'diff completed',
      artifact: 'tmp/ci-validation/sst-diff.json',
      rawText: JSON.stringify([
        { operation: 'update', resource: 'aws:s3/bucket:Bucket:gala-dev-assets', detail: 'bucket policy changed' },
      ]),
    },
    dockerImageSize: {
      status: 'passed',
      reason: '',
      artifact: 'tmp/ci-validation/docker-image-size.json',
      runtimeBaseBytes: 100,
      appLayerBytes: 50,
      productionBytes: 150,
    },
    releaseGates: [
      { name: 'deploy_control', status: 'passed', summary: 'deploy remains operator-driven' },
    ],
    ...overrides,
  };
}

function assertNoEmail(value) {
  assert.doesNotMatch(String(value), /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
}

function assertNoBannedCopy(value) {
  const lower = String(value).toLowerCase();
  for (const token of BANNED_OUTPUT_TOKENS) {
    assert.equal(lower.includes(token), false, `expected output to omit ${token}`);
  }
  assert.doesNotMatch(String(value), /\b\d+\/100\b/);
}

function assertHeadingsInOrder(text) {
  let cursor = -1;
  for (const heading of FIXED_HEADINGS) {
    const index = text.indexOf(heading);
    assert.ok(index > cursor, `${heading} should render after prior heading`);
    cursor = index;
  }
}

test('normalizes suite matrix categories and marks missing required suites not_run', () => {
  const suites = normalizeSuites([{ category: 'unit', status: 'passed', summary: 'ok' }]);
  assert.equal(suites.unit.status, 'passed');
  assert.equal(suites.integration.status, 'not_run');
  assert.equal(suites.lint_ruby.status, 'not_run');
  assert.equal(suites.lint_eslint.status, 'not_run');
  assert.equal(suites.lint_style.status, 'not_run');
  assert.equal(suites.lint_factory.status, 'not_run');
  assert.equal(suites.integration_frontend.status, 'not_run');
  assert.equal(suites.system.reason, 'suite result was not provided');
});

test('missing required suites and infrastructure evidence make the report non-success', () => {
  const report = buildReport({
    suites: [{ category: 'unit', status: 'passed' }],
    sstDiff: { status: 'passed' },
    dockerImageSize: { status: 'passed' },
  });
  assert.equal(report.suites.integration.status, 'not_run');
  assert.equal(report.state, 'failure');
});

test('failed warning error and not-run required dimensions make state non-success', () => {
  for (const status of ['failed', 'warning', 'not_run']) {
    const report = buildReport(baseInput({
      suites: REQUIRED_SUITE_INPUTS.map((suite) => (
        suite.category === 'unit' ? { ...suite, status } : suite
      )),
    }));
    assert.equal(report.state, 'failure', status);
  }

  const report = buildReport(baseInput({
    dockerImageSize: { status: 'error', reason: 'docker image inspect exited 1' },
  }));
  assert.equal(report.state, 'error');
});

test('optional system suite failures remain visible without failing the report', () => {
  const report = buildReport(baseInput({
    suites: [
      ...REQUIRED_SUITE_INPUTS,
      { category: 'system', status: 'failed', reason: 'smoke target unavailable' },
    ],
  }));
  assert.equal(report.suites.system.status, 'failed');
  assert.equal(report.state, 'success');
});

test('redacts secret-like values and email addresses before report rendering', () => {
  const redacted = redactSecrets({
    DATABASE_URL: 'postgres://user:pass@example.test/db',
    nested: 'TOKEN=abc123 PASSWORD=hunter2 Nathan Papes <nathan.papes@gmail.com>',
    ok: 'safe',
  });
  assert.equal(redacted.DATABASE_URL, '[REDACTED]');
  assert.match(redacted.nested, /TOKEN=\[REDACTED\]/);
  assert.match(redacted.nested, /PASSWORD=\[REDACTED\]/);
  assertNoEmail(redacted.nested);
  assert.equal(redacted.ok, 'safe');
});

test('report text JSON and status payload omit email addresses', () => {
  const report = buildReport(baseInput({
    commitSummary: 'Fix report for Nathan Papes <nathan.papes@gmail.com>',
    contributors: ['Nathan Papes <nathan.papes@gmail.com>'],
    suites: [
      ...REQUIRED_SUITE_INPUTS,
      {
        category: 'system',
        status: 'failed',
        summary: 'login failed for nathan.papes@gmail.com',
        failures: ['spec/system/login_spec.rb:12 email nathan.papes@gmail.com'],
      },
    ],
  }));
  const text = renderReportText(report);
  const payload = payloadFromReport(report, 'https://example.test/report');
  assertNoEmail(text);
  assertNoEmail(JSON.stringify(report));
  assertNoEmail(payload.description);
});

test('report text and status payload use only objective copy', () => {
  const report = buildReport(baseInput());
  const text = renderReportText(report);
  const payload = payloadFromReport(report, 'https://example.test/report');
  assertNoBannedCopy(text);
  assertNoBannedCopy(payload.description);
});

test('rendered report keeps the fixed heading order for passing and failing inputs', () => {
  const passingText = renderReportText(buildReport(baseInput()));
  assertHeadingsInOrder(passingText);

  const failingText = renderReportText(buildReport(baseInput({
    suites: REQUIRED_SUITE_INPUTS.map((suite) => (
      suite.category === 'integration' ? { ...suite, status: 'failed', reason: 'exit 1' } : suite
    )),
  })));
  assertHeadingsInOrder(failingText);
});

test('task matrix keeps suite rows and required infrastructure rows', () => {
  const text = renderReportText(buildReport(baseInput()));
  for (const dimension of [
    'unit',
    'integration',
    'lint_ruby',
    'lint_eslint',
    'lint_style',
    'lint_factory',
    'integration_frontend',
    'system',
    'sst_diff',
    'docker_image_size',
  ]) {
    assert.match(text, new RegExp(`\\b${dimension}\\b`));
  }
  assert.doesNotMatch(text, /sst_refresh/);
});

test('SST diff raw output renders a deterministic mutation section', () => {
  const report = buildReport(baseInput({
    sstDiff: {
      status: 'passed',
      artifact: 'tmp/ci-validation/sst-diff.json',
      rawText: JSON.stringify([
        { operation: 'create', resource: 'aws:cloudfront/distribution:Distribution:gala-dev' },
        { operation: 'update', resource: 'aws:s3/bucket:Bucket:gala-dev-assets' },
      ]),
    },
  }));
  const text = renderReportText(report);
  assert.match(text, /sst_diff_mutation:/);
  assert.match(text, /create/);
  assert.match(text, /aws:cloudfront\/distribution/);
  assert.match(text, /update/);
  assert.match(text, /aws:s3\/bucket/);
});

test('Docker image-size evidence renders measured math and unavailable measurements', () => {
  const measured = buildReport(baseInput({
    dockerImageSize: {
      status: 'passed',
      artifact: 'tmp/ci-validation/docker-image-size.json',
      runtimeBaseBytes: 125,
      appLayerBytes: 25,
      productionBytes: 150,
    },
  }));
  const measuredText = renderReportText(measured);
  assert.match(measuredText, /docker_image_size:/);
  assert.match(measuredText, /runtime_base_bytes/);
  assert.match(measuredText, /125 \+ 25 = 150/);

  const unavailable = buildReport(baseInput({
    dockerImageSize: {
      status: 'failed',
      reason: 'docker image inspect did not return numeric bytes',
      artifact: 'tmp/ci-validation/docker-image-size.json',
    },
  }));
  const unavailableText = renderReportText(unavailable);
  assert.equal(unavailable.state, 'failure');
  assert.match(unavailableText, /unavailable/);
  assert.match(unavailableText, /docker image inspect did not return numeric bytes/);
});

test('failure context includes dimension file line and short snippet when provided', () => {
  const report = buildReport(baseInput({
    suites: REQUIRED_SUITE_INPUTS.map((suite) => (
      suite.category === 'unit'
        ? {
            ...suite,
            status: 'failed',
            reason: 'exit 1',
            command: 'node --test scripts/ci/*.test.mjs',
            summary: 'scripts/ci/validation-report.test.mjs:44:13 expected headings to match',
            failures: [
              'scripts/ci/validation-report.test.mjs:44:13 expected headings to match',
              '.github/workflows/ci.yml:211:7 shell step exited',
              'infra/sst.config.ts:22:5 stack output changed',
              'Dockerfile.production:17 package install failed',
            ],
          }
        : suite
    )),
  }));
  const text = renderReportText(report);
  assert.match(text, /failure_context:/);
  assert.match(text, /unit/);
  assert.match(text, /scripts\/ci\/validation-report\.test\.mjs:44:13/);
  assert.match(text, /\.github\/workflows\/ci\.yml:211:7/);
  assert.match(text, /infra\/sst\.config\.ts:22:5/);
  assert.match(text, /Dockerfile\.production:17/);
});

test('final status payload uses objective counts and infrastructure statuses', () => {
  const report = buildReport(baseInput({
    suites: REQUIRED_SUITE_INPUTS.map((suite) => (
      suite.category === 'unit' ? { ...suite, status: 'failed', reason: 'exit 1' } : suite
    )),
  }));
  const payload = payloadFromReport(report, 'https://example.test/artifact');
  assert.equal(payload.context, 'gala/ci');
  assert.equal(payload.state, 'failure');
  assert.equal(payload.target_url, 'https://example.test/artifact');
  assert.match(payload.description, /^failure: Make CI report objective /);
  assert.match(payload.description, /failed=1/);
  assert.match(payload.description, /not_run=0/);
  assert.match(payload.description, /sst_diff=passed/);
  assert.match(payload.description, /docker_image_size=passed/);
  assertNoBannedCopy(payload.description);
});

test('builds GitHub commit status payloads for all supported states', () => {
  for (const state of ['pending', 'success', 'failure', 'error']) {
    const payload = buildStatusPayload({ state, targetUrl: 'https://example.test/report', description: `${state} status` });
    assert.equal(payload.state, state);
    assert.equal(payload.context, STATUS_CONTEXT);
    assert.equal(payload.target_url, 'https://example.test/report');
    assert.ok(payload.description.length <= 140);
  }
});

test('prefers PR head sha for advisory commit statuses', () => {
  assert.equal(resolveStatusSha({
    GITHUB_SHA: 'merge-sha',
    PR_HEAD_SHA: 'head-sha',
  }), 'head-sha');
  assert.equal(resolveStatusSha({ GITHUB_SHA: 'merge-sha' }, 'explicit-sha'), 'explicit-sha');
});

test('truncates commit summaries to 80 characters', () => {
  const summary = truncateSummary('a'.repeat(120));
  assert.equal(summary.length, 80);
  assert.match(summary, /\.\.\.$/);
});

test('writeReport emits reusable deterministic fixture outputs', () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gala-ci-report-'));
  const { report, textPath, jsonPath } = writeReport(baseInput(), outDir);
  assert.equal(report.state, 'success');
  assert.ok(fs.existsSync(textPath));
  assert.ok(fs.existsSync(jsonPath));
  const text = fs.readFileSync(textPath, 'utf8');
  assertHeadingsInOrder(text);
});

test('report generation errors map to error state', () => {
  const suites = normalizeSuites(REQUIRED_SUITE_INPUTS);
  assert.equal(finalState({ suites, reportError: true }), 'error');
});
