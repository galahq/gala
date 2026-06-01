import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildReport,
  detectDestructiveWarnings,
  finalState,
  normalizeSuites,
  redactSecrets,
  renderReportText,
  truncateSummary,
} from './validation-report.mjs';
import { buildStatusPayload, payloadFromReport, resolveStatusSha, STATUS_CONTEXT } from './post-commit-status.mjs';

test('normalizes unit integration system categories and marks missing suites not_run', () => {
  const suites = normalizeSuites([{ category: 'unit', status: 'passed', summary: 'ok' }]);
  assert.equal(suites.unit.status, 'passed');
  assert.equal(suites.integration.status, 'not_run');
  assert.equal(suites.integration_full.status, 'not_run');
  assert.equal(suites.system.reason, 'suite result was not provided');
});

test('truncates commit summaries to 80 characters', () => {
  const summary = truncateSummary('a'.repeat(120));
  assert.equal(summary.length, 80);
  assert.match(summary, /\.\.\.$/);
});

test('redacts secret-like keys and inline assignments', () => {
  const redacted = redactSecrets({
    DATABASE_URL: 'postgres://user:pass@example/db',
    nested: 'TOKEN=abc123 PASSWORD=hunter2 visible=value',
    ok: 'safe',
  });
  assert.equal(redacted.DATABASE_URL, '[REDACTED]');
  assert.match(redacted.nested, /TOKEN=\[REDACTED\]/);
  assert.match(redacted.nested, /PASSWORD=\[REDACTED\]/);
  assert.equal(redacted.ok, 'safe');
});

test('detects high-confidence destructive infrastructure warnings', () => {
  const warnings = detectDestructiveWarnings('Plan will replace database and delete CloudFront alias');
  assert.ok(warnings.some((warning) => warning.confidence === 'high'));
});

test('keeps benign destructive words low confidence', () => {
  const warnings = detectDestructiveWarnings('Remove this stale comment from the report copy');
  assert.equal(warnings[0].confidence, 'low');
});

test('destructive warnings alone do not map final state to failure', () => {
  const suites = normalizeSuites([
    { category: 'unit', status: 'passed' },
    { category: 'integration', status: 'passed' },
    { category: 'system', status: 'passed' },
  ]);
  assert.equal(finalState({ suites, warnings: [{ confidence: 'high' }] }), 'success');
});

test('final state ignores optional advisory suite failures', () => {
  const suites = normalizeSuites([
    { category: 'unit', status: 'passed' },
    { category: 'integration', status: 'passed' },
    { category: 'integration_full', status: 'failed' },
    { category: 'system', status: 'not_run' },
  ]);
  assert.equal(finalState({ suites }), 'success');
});

test('report text contains required high-signal dimensions', () => {
  const report = buildReport({
    commitSummary: 'Add CI validation report',
    commitCount: 2,
    contributors: ['alice', 'bob'],
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
    },
    suites: [{ category: 'unit', status: 'passed', artifact: 'unit.log' }],
    sstRefresh: { status: 'not_run', reason: 'missing credentials' },
    sstDiff: { status: 'passed', rawText: 'no changes' },
  });
  const text = renderReportText(report);
  for (const token of ['unit', 'integration', 'integration_full', 'system', 'sst_refresh', 'sst_diff', 'destructive_warnings', 'release_gates', 'contributors', 'commit_count', 'confidence', 'run:', 'pr_ref:', 'run_url:', 'suite_artifacts:', 'top_failure_lines:']) {
    assert.match(text, new RegExp(token));
  }
});

test('report text includes actionable failed-suite context', () => {
  const report = buildReport({
    suites: [{
      category: 'integration',
      status: 'failed',
      reason: 'timeout after 240s',
      command: './run-rspec.sh spec/requests/case_routes_spec.rb',
      artifact: 'tmp/ci-validation/integration.log',
      summary: 'bundle exec rspec hung waiting for database',
      exitCode: 124,
      timedOut: true,
      triage: 'suite timed out; inspect tmp/ci-validation/integration.log',
    }],
  });
  const text = renderReportText(report);
  assert.match(text, /failure_context/);
  assert.match(text, /integration/);
  assert.match(text, /timeout after 240s/);
  assert.match(text, /tmp\/ci-validation\/integration\.log/);
});

test('failed suites map report state to failure', () => {
  const report = buildReport({ suites: [{ category: 'unit', status: 'failed' }] });
  assert.equal(report.state, 'failure');
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

test('builds final status payload from report artifact data', () => {
  const report = buildReport({ suites: [{ category: 'unit', status: 'passed' }] });
  const payload = payloadFromReport(report, 'https://example.test/artifact');
  assert.equal(payload.context, 'gala/ci-validation');
  assert.equal(payload.state, 'success');
  assert.equal(payload.target_url, 'https://example.test/artifact');
});

test('prefers PR head sha for advisory commit statuses', () => {
  assert.equal(resolveStatusSha({
    GITHUB_SHA: 'merge-sha',
    PR_HEAD_SHA: 'head-sha',
  }), 'head-sha');
  assert.equal(resolveStatusSha({ GITHUB_SHA: 'merge-sha' }, 'explicit-sha'), 'explicit-sha');
});

test('report generation marks infrastructure errors as error state', () => {
  const report = buildReport({ reportError: true });
  assert.equal(report.state, 'error');
});
