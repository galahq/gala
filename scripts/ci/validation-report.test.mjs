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
import { buildStatusPayload, payloadFromReport, STATUS_CONTEXT } from './post-commit-status.mjs';

test('normalizes unit integration system categories and marks missing suites not_run', () => {
  const suites = normalizeSuites([{ category: 'unit', status: 'passed', summary: 'ok' }]);
  assert.equal(suites.unit.status, 'passed');
  assert.equal(suites.integration.status, 'not_run');
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

test('report text contains required high-signal dimensions', () => {
  const report = buildReport({
    commitSummary: 'Add CI validation report',
    commitCount: 2,
    contributors: ['alice', 'bob'],
    suites: [{ category: 'unit', status: 'passed', artifact: 'unit.log' }],
    sstRefresh: { status: 'not_run', reason: 'missing credentials' },
    sstDiff: { status: 'passed', rawText: 'no changes' },
  });
  const text = renderReportText(report);
  for (const token of ['unit', 'integration', 'system', 'sst_refresh', 'sst_diff', 'destructive_warnings', 'release_gates', 'contributors', 'commit_count', 'confidence']) {
    assert.match(text, new RegExp(token));
  }
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

test('report generation marks infrastructure errors as error state', () => {
  const report = buildReport({ reportError: true });
  assert.equal(report.state, 'error');
});
