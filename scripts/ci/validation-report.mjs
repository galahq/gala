import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const REQUIRED_SUITE_CATEGORIES = [
  'unit',
  'integration',
  'lint_ruby',
  'lint_eslint',
  'lint_style',
  'lint_factory',
  'integration_frontend',
];
export const OPTIONAL_SUITE_CATEGORIES = ['system'];
export const SUITE_MATRIX_CATEGORIES = [...REQUIRED_SUITE_CATEGORIES, ...OPTIONAL_SUITE_CATEGORIES];
export const CONFIDENCE_EXCLUDED_SUITE_CATEGORIES = new Set([
  'lint_ruby',
  'lint_eslint',
  'lint_style',
  'lint_factory',
]);
export const CONFIDENCE_EXCLUDED_INFRA_CATEGORIES = new Set([
  'sst_refresh',
  'sst_diff',
]);

const CONFIDENCE_EXCLUSION_REASONS = {
  lint_ruby: 'repo-wide Ruby lint baseline is tracked as CI evidence but excluded from release-evidence confidence',
  lint_eslint: 'repo-wide ESLint baseline is tracked as CI evidence but excluded from release-evidence confidence',
  lint_style: 'repo-wide stylelint baseline is tracked as CI evidence but excluded from release-evidence confidence',
  lint_factory: 'factory lint warnings are tracked as CI evidence but excluded from release-evidence confidence',
  sst_refresh: 'AWS credentials are optional in advisory PR CI; attach operator infra evidence in the release checklist',
  sst_diff: 'AWS credentials are optional in advisory PR CI; attach operator infra evidence in the release checklist',
};

const SECRET_KEY_PATTERN = /(TOKEN|PASSWORD|SECRET|DATABASE_URL|REDIS_URL|RAILS_MASTER_KEY|PRIVATE_KEY|API_KEY)/i;
const STATUS_MAP = new Map([
  ['pass', 'passed'],
  ['passed', 'passed'],
  ['success', 'passed'],
  ['ok', 'passed'],
  ['fail', 'failed'],
  ['failed', 'failed'],
  ['failure', 'failed'],
  ['error', 'error'],
  ['errored', 'error'],
  ['warning', 'warning'],
  ['warn', 'warning'],
  ['skip', 'not_run'],
  ['skipped', 'not_run'],
  ['not_run', 'not_run'],
  ['not-run', 'not_run'],
]);

const DESTRUCTIVE_TERMS = [
  'delete',
  'deleted',
  'deleting',
  'destroy',
  'destroyed',
  'destroying',
  'replace',
  'replacement',
  'recreate',
  'remove',
  'removal',
  'detach',
  'drop',
  'truncate',
  'public access',
  'bucket policy',
  'lifecycle',
  'secret removal',
  'iam wildcard',
  'administrator access',
];

const CRITICAL_RESOURCE_TERMS = [
  'database',
  'postgres',
  'rds',
  'cache',
  'redis',
  'valkey',
  'bucket',
  's3',
  'dns',
  'alias',
  'certificate',
  'secret',
  'iam',
  'policy',
  'cloudfront',
  'distribution',
];

const RESOURCE_HINT_TERMS = [
  'aws',
  'sst',
  'resource',
  'ecs',
  'service',
  'task',
  'role',
  'security group',
];

function compact(value) {
  return `${value ?? ''}`.replace(/\s+/g, ' ').trim();
}

function clip(value, limit = 120) {
  const clean = compact(value);
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, Math.max(0, limit - 3))}...`;
}

function normalizeStatus(status) {
  return STATUS_MAP.get(compact(status).toLowerCase()) ?? 'not_run';
}

export function truncateSummary(summary, limit = 80) {
  const clean = compact(summary) || 'No commit summary available';
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, Math.max(0, limit - 3))}...`;
}

export function redactSecrets(value) {
  if (Array.isArray(value)) return value.map((entry) => redactSecrets(entry));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        SECRET_KEY_PATTERN.test(key) ? '[REDACTED]' : redactSecrets(entry),
      ]),
    );
  }
  if (typeof value === 'string') {
    return value.replace(
      /([A-Z0-9_]*(?:TOKEN|PASSWORD|SECRET|DATABASE_URL|REDIS_URL|RAILS_MASTER_KEY|PRIVATE_KEY|API_KEY)[A-Z0-9_]*\s*[=:]\s*)[^\s,;]+/gi,
      '$1[REDACTED]',
    );
  }
  return value;
}

export function normalizeSuites(suites = []) {
  const byCategory = new Map();

  for (const suite of Array.isArray(suites) ? suites : []) {
    const category = compact(suite.category).toLowerCase();
    if (!SUITE_MATRIX_CATEGORIES.includes(category)) continue;
    const normalizedStatus = normalizeStatus(suite.status);
    const hasFailureContext = ['failed', 'error', 'warning'].includes(normalizedStatus);
    byCategory.set(category, {
      category,
      name: compact(suite.name) || category,
      command: compact(suite.command),
      status: normalizedStatus,
      reason: compact(suite.reason),
      summary: compact(suite.summary),
      artifactUrl: compact(suite.artifactUrl || suite.artifact_url),
      durationMs: Number.isFinite(Number(suite.durationMs)) ? Number(suite.durationMs) : null,
      artifact: compact(suite.artifact),
      exitCode: Number.isFinite(Number(suite.exitCode)) ? Number(suite.exitCode) : null,
      timedOut: Boolean(suite.timedOut),
      triage: compact(suite.triage),
      failures: hasFailureContext && Array.isArray(suite.failures)
        ? suite.failures.map((failure) => redactSecrets(failure))
        : [],
    });
  }

  return Object.fromEntries(
    SUITE_MATRIX_CATEGORIES.map((category) => [
      category,
      byCategory.get(category) ?? {
        category,
        name: category,
        command: '',
        status: 'not_run',
        reason: 'suite result was not provided',
        summary: 'not run',
        artifactUrl: '',
        durationMs: null,
        artifact: '',
        exitCode: null,
        timedOut: false,
        triage: 'collector did not provide this suite result',
        failures: [],
      },
    ]),
  );
}

function confidenceForLine(line) {
  const lower = line.toLowerCase();
  const hasCritical = CRITICAL_RESOURCE_TERMS.some((term) => lower.includes(term));
  const hasResourceHint = RESOURCE_HINT_TERMS.some((term) => lower.includes(term));
  if (hasCritical) return 'high';
  if (hasResourceHint) return 'medium';
  return 'low';
}

export function detectDestructiveWarnings(input = '') {
  const text = typeof input === 'string' ? input : JSON.stringify(input, null, 2);
  const warnings = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const line = compact(rawLine);
    if (!line) continue;
    const lower = line.toLowerCase();
    const term = DESTRUCTIVE_TERMS.find((candidate) => lower.includes(candidate));
    if (!term) continue;
    warnings.push({
      term,
      confidence: confidenceForLine(line),
      advisory: true,
      message: line.slice(0, 240),
    });
  }

  return warnings;
}

export function finalState({ suites, reportError = false } = {}) {
  if (reportError) return 'error';
  const suiteValues = Object.values(suites ?? {}).filter((suite) => REQUIRED_SUITE_CATEGORIES.includes(suite.category));
  if (suiteValues.some((suite) => suite.status === 'error')) return 'error';
  if (suiteValues.some((suite) => suite.status === 'failed')) return 'failure';
  return 'success';
}

export function calculateConfidence(report) {
  let score = 95;
  const suites = Object.values(report.suites ?? {});
  const excludedDimensions = new Set((report.confidence_exclusions ?? []).map((exclusion) => exclusion.dimension));
  score -= suites
    .filter((suite) => REQUIRED_SUITE_CATEGORIES.includes(suite.category))
    .filter((suite) => !excludedDimensions.has(suite.category))
    .filter((suite) => suite.status === 'not_run').length * 8;
  score -= suites
    .filter((suite) => !excludedDimensions.has(suite.category))
    .filter((suite) => suite.status === 'failed').length * 18;
  score -= suites
    .filter((suite) => !REQUIRED_SUITE_CATEGORIES.includes(suite.category))
    .filter((suite) => !excludedDimensions.has(suite.category))
    .filter((suite) => suite.status === 'failed').length * 6;
  score -= suites
    .filter((suite) => !excludedDimensions.has(suite.category))
    .filter((suite) => suite.status === 'warning').length * 3;
  if (report.infra?.sst_refresh?.status === 'not_run' && !excludedDimensions.has('sst_refresh')) score -= 4;
  if (report.infra?.sst_diff?.status === 'not_run' && !excludedDimensions.has('sst_diff')) score -= 4;
  score -= (report.destructive_warnings ?? []).filter((warning) => warning.confidence === 'high').length * 8;
  return Math.max(35, Math.min(99, score));
}

export function confidenceLabel(score) {
  if (score >= 85) return 'high';
  if (score >= 70) return 'medium';
  return 'low';
}

export function confidenceNotes(report) {
  const suites = Object.values(report.suites ?? {});
  const requiredSuites = suites.filter((suite) => REQUIRED_SUITE_CATEGORIES.includes(suite.category));
  const failedRequired = requiredSuites.filter((suite) => ['failed', 'error'].includes(suite.status));
  const missingRequired = requiredSuites.filter((suite) => suite.status === 'not_run');
  const highDestructiveWarnings = (report.destructive_warnings ?? [])
    .filter((warning) => warning.confidence === 'high');
  const notes = [
    'evidence confidence is a validation-evidence score, not a separate release approval score',
  ];

  if (failedRequired.length > 0) {
    notes.push(`${failedRequired.length} required suite(s) failed or errored; inspect failure_context before release`);
  }
  if (missingRequired.length > 0) {
    notes.push(`${missingRequired.length} required suite(s) did not run; artifact evidence is incomplete`);
  }
  if (report.infra?.sst_refresh?.status === 'not_run' || report.infra?.sst_diff?.status === 'not_run') {
    notes.push('SST refresh/diff evidence was incomplete; treat infrastructure conclusions as advisory');
  }
  if ((report.confidence_exclusions ?? []).length > 0) {
    notes.push(`${report.confidence_exclusions.length} noisy/advisory dimension(s) were excluded from the confidence score but still require release checklist acknowledgement`);
  }
  if (highDestructiveWarnings.length > 0) {
    notes.push(`${highDestructiveWarnings.length} high-confidence destructive infrastructure warning(s) need operator review`);
  }
  if (notes.length === 1) {
    notes.push('required suites passed; remaining score movement comes from advisory coverage and warning signals');
  }

  return notes;
}

export function confidenceExclusions(report) {
  const exclusions = [];
  for (const suite of Object.values(report.suites ?? {})) {
    if (!CONFIDENCE_EXCLUDED_SUITE_CATEGORIES.has(suite.category)) continue;
    if (!['failed', 'error', 'warning'].includes(suite.status)) continue;
    exclusions.push({
      dimension: suite.category,
      status: suite.status,
      reason: CONFIDENCE_EXCLUSION_REASONS[suite.category],
    });
  }

  for (const dimension of CONFIDENCE_EXCLUDED_INFRA_CATEGORIES) {
    const evidence = report.infra?.[dimension];
    if (!evidence || !['warning', 'not_run'].includes(evidence.status)) continue;
    exclusions.push({
      dimension,
      status: evidence.status,
      reason: CONFIDENCE_EXCLUSION_REASONS[dimension],
    });
  }

  return exclusions;
}

function blockingRequiredSuiteFailures(report) {
  const excludedDimensions = new Set((report.confidence_exclusions ?? []).map((exclusion) => exclusion.dimension));
  return Object.values(report.suites ?? {})
    .filter((suite) => REQUIRED_SUITE_CATEGORIES.includes(suite.category))
    .filter((suite) => ['failed', 'error'].includes(suite.status))
    .filter((suite) => !excludedDimensions.has(suite.category));
}

function excludedRequiredSuiteFailures(report) {
  const excludedDimensions = new Set((report.confidence_exclusions ?? []).map((exclusion) => exclusion.dimension));
  return Object.values(report.suites ?? {})
    .filter((suite) => REQUIRED_SUITE_CATEGORIES.includes(suite.category))
    .filter((suite) => ['failed', 'error'].includes(suite.status))
    .filter((suite) => excludedDimensions.has(suite.category));
}

export function releaseReadiness(report) {
  const gates = report.release_gates ?? [];
  const blockingGate = gates.find((gate) => ['failed', 'error'].includes(gate.status));
  const warningGate = gates.find((gate) => gate.status === 'warning');
  const highDestructiveWarnings = (report.destructive_warnings ?? [])
    .filter((warning) => warning.confidence === 'high').length;
  const blockingSuites = blockingRequiredSuiteFailures(report);
  const excludedSuites = excludedRequiredSuiteFailures(report);

  if (blockingSuites.length > 0 || report.state === 'error') {
    return {
      status: 'blocked',
      summary: `required CI evidence did not pass (${blockingSuites.map((suite) => suite.category).join(', ') || 'report error'}); do not release from this artifact`,
    };
  }
  if (blockingGate) {
    return {
      status: 'blocked',
      summary: `release gate ${blockingGate.name || '-'} is ${blockingGate.status}`,
    };
  }
  if (highDestructiveWarnings > 0) {
    return {
      status: 'review_required',
      summary: 'high-confidence destructive infrastructure warning detected',
    };
  }
  if (excludedSuites.length > 0) {
    return {
      status: 'review_required',
      summary: `confidence-excluded CI noise requires checklist acknowledgement (${excludedSuites.map((suite) => suite.category).join(', ')})`,
    };
  }
  if (warningGate) {
    return {
      status: 'review_required',
      summary: `release gate ${warningGate.name || '-'} needs operator review`,
    };
  }
  return {
    status: 'check',
    summary: 'required CI evidence passed; review advisory gaps before release',
  };
}

function normalizeEvidence(value, fallbackName) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    name: compact(source.name) || fallbackName,
    status: normalizeStatus(source.status),
    reason: compact(source.reason),
    summary: compact(source.summary),
    artifact: compact(source.artifact),
  };
}

export function buildReport(input = {}) {
  const redactedInput = redactSecrets(input);
  const suites = normalizeSuites(redactedInput.suites);
  const sstRefresh = normalizeEvidence(redactedInput.sstRefresh, 'sst_refresh');
  const sstDiff = normalizeEvidence(redactedInput.sstDiff, 'sst_diff');
  const generatedWarnings = detectDestructiveWarnings(redactedInput.sstDiff?.rawText ?? redactedInput.sstDiff?.summary ?? '');
  const providedWarnings = Array.isArray(redactedInput.warnings) ? redactedInput.warnings : [];
  const destructiveWarnings = [...providedWarnings, ...generatedWarnings].map((warning) => ({
    confidence: warning.confidence ?? 'low',
    advisory: warning.advisory !== false,
    term: compact(warning.term),
    message: compact(warning.message ?? warning.summary ?? warning),
  }));

  const releaseGates = Array.isArray(redactedInput.releaseGates) && redactedInput.releaseGates.length > 0
    ? redactedInput.releaseGates.map((gate) => ({
        name: compact(gate.name),
        status: normalizeStatus(gate.status),
        summary: compact(gate.summary),
      }))
    : [
        {
          name: 'deploy_control',
          status: 'passed',
          summary: 'deploy remains operator-driven and separate from advisory CI',
        },
      ];

  const report = {
    generated_at: new Date().toISOString(),
    summary80: truncateSummary(redactedInput.changeset?.summary ?? redactedInput.commitSummary),
    run_context: {
      run_id: compact(redactedInput.runContext?.runId),
      run_attempt: compact(redactedInput.runContext?.runAttempt),
      run_url: compact(redactedInput.runContext?.runUrl),
      event: compact(redactedInput.runContext?.eventName),
      actor: compact(redactedInput.runContext?.actor),
      repository: compact(redactedInput.runContext?.repository),
      pr_number: compact(redactedInput.runContext?.prNumber),
      pr_title: compact(redactedInput.runContext?.prTitle),
      head_ref: compact(redactedInput.runContext?.headRef),
      base_ref: compact(redactedInput.runContext?.baseRef),
      head_sha: compact(redactedInput.runContext?.headSha),
      base_sha: compact(redactedInput.runContext?.baseSha),
      artifacts_url: compact(redactedInput.runContext?.artifactsUrl),
    },
    contributors: Array.isArray(redactedInput.contributors) ? redactedInput.contributors.map(compact).filter(Boolean) : [],
    commit_count: Number.isFinite(Number(redactedInput.commitCount)) ? Number(redactedInput.commitCount) : 0,
    changeset: {
      files_changed: Number.isFinite(Number(redactedInput.changeset?.filesChanged)) ? Number(redactedInput.changeset.filesChanged) : 0,
      additions: Number.isFinite(Number(redactedInput.changeset?.additions)) ? Number(redactedInput.changeset.additions) : 0,
      deletions: Number.isFinite(Number(redactedInput.changeset?.deletions)) ? Number(redactedInput.changeset.deletions) : 0,
      summary: truncateSummary(redactedInput.changeset?.summary ?? redactedInput.commitSummary),
    },
    suites,
    infra: {
      sst_refresh: sstRefresh,
      sst_diff: sstDiff,
    },
    destructive_warnings: destructiveWarnings,
    release_gates: releaseGates,
  };

  report.state = finalState({ suites, reportError: Boolean(redactedInput.reportError) });
  report.confidence_exclusions = confidenceExclusions(report);
  report.confidence = calculateConfidence(report);
  report.confidence_label = confidenceLabel(report.confidence);
  report.confidence_notes = confidenceNotes(report);
  report.release_readiness = releaseReadiness(report);
  return report;
}

function table(rows) {
  const widths = rows[0].map((_, index) => Math.max(...rows.map((row) => `${row[index] ?? ''}`.length)));
  const line = `+${widths.map((width) => '-'.repeat(width + 2)).join('+')}+`;
  const format = (row) => `|${row.map((cell, index) => ` ${`${cell ?? ''}`.padEnd(widths[index])} `).join('|')}|`;
  return [line, format(rows[0]), line, ...rows.slice(1).map(format), line].join('\n');
}

function extractFailureLocations(failures = []) {
  const locationPattern = /(?:^|[\s#(])((?:\.\/)?(?:app|spec|config|lib|db|scripts|infra|docs|test)\/[A-Za-z0-9_./-]+\.rb:\d+\b)/g;
  const locations = [];
  for (const failure of failures) {
    for (const match of `${failure}`.matchAll(locationPattern)) {
      locations.push(match[1]);
    }
  }
  return Array.from(new Set(locations)).slice(0, 10);
}

function makeFailureLocationLink(location, runContext) {
  const match = String(location).match(/([A-Za-z0-9_./-]+\.rb):(\d+)\b/);
  if (!match) return location;
  const repository = compact(runContext?.repository || '');
  const sha = compact(runContext?.head_sha || runContext?.base_sha || '');
  if (!repository || !sha) return location;
  const filePath = match[1].replace(/^\.\//, '');
  const line = match[2];
  return `[${filePath}:${line}](https://github.com/${repository}/blob/${sha}/${filePath}#L${line})`;
}

export function renderReportText(report) {
  const suiteRows = [
    ['dimension', 'status', 'why', 'artifact'],
    ...SUITE_MATRIX_CATEGORIES.map((category) => {
      const suite = report.suites[category];
      return [category, suite.status, clip(suite.reason || suite.summary || 'recorded', 96), suite.artifact || '-'];
    }),
    ['sst_refresh', report.infra.sst_refresh.status, clip(report.infra.sst_refresh.reason || report.infra.sst_refresh.summary || 'recorded', 96), report.infra.sst_refresh.artifact || '-'],
    ['sst_diff', report.infra.sst_diff.status, clip(report.infra.sst_diff.reason || report.infra.sst_diff.summary || 'recorded', 96), report.infra.sst_diff.artifact || '-'],
  ];

  const warningRows = [
    ['warning_confidence', 'advisory', 'term', 'message'],
    ...(report.destructive_warnings.length > 0
      ? report.destructive_warnings.map((warning) => [warning.confidence, 'yes', warning.term || '-', warning.message || '-'])
      : [['none', 'yes', '-', 'no destructive warnings detected']]),
  ];

  const gateRows = [
    ['gate', 'status', 'summary'],
    ...report.release_gates.map((gate) => [gate.name || '-', gate.status, gate.summary || '-']),
  ];

  const confidenceExclusionRows = [
    ['dimension', 'status', 'why'],
    ...((report.confidence_exclusions ?? []).length > 0
      ? report.confidence_exclusions.map((exclusion) => [exclusion.dimension, exclusion.status, clip(exclusion.reason, 120)])
      : [['none', '-', 'no confidence exclusions applied']]),
  ];

  const failedSuites = Object.values(report.suites).filter((suite) => ['failed', 'error', 'warning'].includes(suite.status));

  const failingLinks = failedSuites.flatMap((suite) => {
    const extracted = suite.failures.slice(0, 8).map((failure) => `${suite.category}: ${failure}`.trim());
    if (extracted.length > 0) return extracted;
    const link = suite.artifactUrl ? `${suite.artifactUrl}` : (suite.artifact || '-');
    return [`${suite.category}: ${link} ${suite.reason || suite.summary || 'failed'}`.trim()];
  });

  const failureContextLinks = Object.values(report.suites)
    .flatMap((suite) => {
      if (!['failed', 'error'].includes(suite.status)) return [];
      if (!suite.failures || suite.failures.length === 0) return [];
      return suite.failures.slice(0, 10).map((line) => `- ${suite.category}: ${clip(line, 140)}`);
    });

  const failureContextRows = [
    ['dimension', 'exit', 'timeout', 'next', 'last_log'],
    ...Object.values(report.suites)
      .filter((suite) => ['failed', 'error'].includes(suite.status))
      .map((suite) => [
        suite.category,
        suite.exitCode ?? '-',
        suite.timedOut ? 'yes' : 'no',
        clip(suite.triage || suite.command || 'inspect artifact', 96),
        clip(suite.summary || suite.reason || '-', 200),
      ]),
  ];

  const failureLocations = failedSuites.flatMap((suite) => extractFailureLocations(suite.failures)
    .map((location) => `- ${suite.category}: ${makeFailureLocationLink(location, report.run_context)}`));

  return [
    'GALA CI',
    '',
    `state: ${report.state}`,
    `release_readiness: ${report.release_readiness?.status || 'unknown'} - ${report.release_readiness?.summary || '-'}`,
    `evidence_confidence: ${report.confidence}/100 (${report.confidence_label})`,
    'confidence_notes:',
    ...(report.confidence_notes ?? []).map((note) => `- ${note}`),
    'confidence_exclusions:',
    table(confidenceExclusionRows),
    `commit_summary: ${report.summary80}`,
    `run: id=${report.run_context.run_id || '-'} attempt=${report.run_context.run_attempt || '-'} event=${report.run_context.event || '-'} actor=${report.run_context.actor || '-'}`,
    `pr_ref: #${report.run_context.pr_number || '-'} ${report.run_context.head_ref || '-'} -> ${report.run_context.base_ref || '-'} head=${report.run_context.head_sha ? report.run_context.head_sha.slice(0, 8) : '-'}`,
    `run_url: ${report.run_context.run_url || '-'}`,
    `contributors: ${report.contributors.length ? report.contributors.join(', ') : 'not available'}`,
    `commit_count: ${report.commit_count}`,
    `changeset: files=${report.changeset.files_changed} additions=${report.changeset.additions} deletions=${report.changeset.deletions}`,
    '',
    'test_and_infra_matrix:',
    table(suiteRows),
    '',
    'destructive_warnings:',
    table(warningRows),
    '',
    'release_gates:',
    table(gateRows),
    '',
    'failure_links:',
    ...(failingLinks.length ? failingLinks.map((link) => `- ${link}`) : ['- none']),
    '',
    'failure_context:',
    failureContextRows.length > 1 ? table(failureContextRows) : '- none',
    '',
    'top_failure_lines:',
    ...(failureContextLinks.length ? failureContextLinks : ['- none']),
    '',
    'failure_locations:',
    ...(failureLocations.length ? failureLocations : ['- none']),
    '',
    `suite_artifacts: ${report.run_context.artifacts_url || report.run_context.run_url || '-'}`,
    '',
  ].join('\n');
}

export function writeReport(input, outDir = 'tmp/ci-validation') {
  const report = buildReport(input);
  fs.mkdirSync(outDir, { recursive: true });
  const textPath = path.join(outDir, 'validation-report.txt');
  const jsonPath = path.join(outDir, 'validation-report.json');
  fs.writeFileSync(textPath, renderReportText(report));
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  return { report, textPath, jsonPath };
}

function parseArgs(argv) {
  const args = { outDir: 'tmp/ci-validation', input: '' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--input') args.input = argv[++index];
    else if (arg === '--out-dir') args.outDir = argv[++index];
    else if (arg === '--print') args.print = true;
  }
  return args;
}

function readInput(inputPath) {
  const envRunContext = {
    runId: process.env.GITHUB_RUN_ID,
    runAttempt: process.env.GITHUB_RUN_ATTEMPT,
    runUrl: process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_SERVER_URL ?? 'https://github.com'}/${process.env.GITHUB_REPOSITORY ?? ''}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : '',
    eventName: process.env.GITHUB_EVENT_NAME,
    actor: process.env.GITHUB_ACTOR,
    prNumber: process.env.PR_NUMBER,
    prTitle: process.env.PR_TITLE,
    headRef: process.env.PR_HEAD_REF,
    baseRef: process.env.PR_BASE_REF,
    headSha: process.env.PR_HEAD_SHA,
    baseSha: process.env.PR_BASE_SHA,
    repository: process.env.GITHUB_REPOSITORY,
    artifactsUrl: `${process.env.GITHUB_SERVER_URL ?? 'https://github.com'}/${process.env.GITHUB_REPOSITORY ?? ''}/actions/runs/${process.env.GITHUB_RUN_ID || ''}/artifacts`,
  };

  if (inputPath) {
    if (!fs.existsSync(inputPath)) {
      return {
        reportError: true,
        commitSummary: 'validation input missing',
        runContext: envRunContext,
        suites: [],
        sstRefresh: {
          status: 'not_run',
          reason: `input file not found: ${inputPath}`,
        },
        sstDiff: {
          status: 'not_run',
          reason: `input file not found: ${inputPath}`,
        },
        releaseGates: [
          {
            name: 'report_generation',
            status: 'error',
            summary: 'validation input was unavailable',
          },
        ],
      };
    }
    return JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  }
  if (process.env.CI_VALIDATION_INPUT) return JSON.parse(process.env.CI_VALIDATION_INPUT);
  return { runContext: envRunContext };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = parseArgs(process.argv.slice(2));
  const { report, textPath, jsonPath } = writeReport(readInput(args.input), args.outDir);
  if (args.print) process.stdout.write(renderReportText(report));
  else process.stdout.write(`validation report written: ${textPath} ${jsonPath}\n`);
}
