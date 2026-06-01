import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const REQUIRED_SUITE_CATEGORIES = ['unit', 'integration', 'system'];

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
    if (!REQUIRED_SUITE_CATEGORIES.includes(category)) continue;
    byCategory.set(category, {
      category,
      name: compact(suite.name) || category,
      command: compact(suite.command),
      status: normalizeStatus(suite.status),
      reason: compact(suite.reason),
      summary: compact(suite.summary),
      durationMs: Number.isFinite(Number(suite.durationMs)) ? Number(suite.durationMs) : null,
      artifact: compact(suite.artifact),
      failures: Array.isArray(suite.failures) ? suite.failures.map((failure) => redactSecrets(failure)) : [],
    });
  }

  return Object.fromEntries(
    REQUIRED_SUITE_CATEGORIES.map((category) => [
      category,
      byCategory.get(category) ?? {
        category,
        name: category,
        command: '',
        status: 'not_run',
        reason: 'suite result was not provided',
        summary: 'not run',
        durationMs: null,
        artifact: '',
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
  const suiteValues = Object.values(suites ?? {});
  if (suiteValues.some((suite) => suite.status === 'error')) return 'error';
  if (suiteValues.some((suite) => suite.status === 'failed')) return 'failure';
  return 'success';
}

export function calculateConfidence(report) {
  let score = 95;
  const suites = Object.values(report.suites ?? {});
  score -= suites.filter((suite) => suite.status === 'not_run').length * 8;
  score -= suites.filter((suite) => suite.status === 'failed').length * 18;
  if (report.infra?.sst_refresh?.status === 'not_run') score -= 4;
  if (report.infra?.sst_diff?.status === 'not_run') score -= 4;
  score -= (report.destructive_warnings ?? []).filter((warning) => warning.confidence === 'high').length * 8;
  return Math.max(35, Math.min(99, score));
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
  report.confidence = calculateConfidence(report);
  return report;
}

function table(rows) {
  const widths = rows[0].map((_, index) => Math.max(...rows.map((row) => `${row[index] ?? ''}`.length)));
  const line = `+${widths.map((width) => '-'.repeat(width + 2)).join('+')}+`;
  const format = (row) => `|${row.map((cell, index) => ` ${`${cell ?? ''}`.padEnd(widths[index])} `).join('|')}|`;
  return [line, format(rows[0]), line, ...rows.slice(1).map(format), line].join('\n');
}

export function renderReportText(report) {
  const suiteRows = [
    ['dimension', 'status', 'summary', 'artifact'],
    ...REQUIRED_SUITE_CATEGORIES.map((category) => {
      const suite = report.suites[category];
      return [category, suite.status, suite.reason || suite.summary || 'recorded', suite.artifact || '-'];
    }),
    ['sst_refresh', report.infra.sst_refresh.status, report.infra.sst_refresh.reason || report.infra.sst_refresh.summary || 'recorded', report.infra.sst_refresh.artifact || '-'],
    ['sst_diff', report.infra.sst_diff.status, report.infra.sst_diff.reason || report.infra.sst_diff.summary || 'recorded', report.infra.sst_diff.artifact || '-'],
  ];

  const warningRows = [
    ['confidence', 'advisory', 'term', 'message'],
    ...(report.destructive_warnings.length > 0
      ? report.destructive_warnings.map((warning) => [warning.confidence, 'yes', warning.term || '-', warning.message || '-'])
      : [['none', 'yes', '-', 'no destructive warnings detected']]),
  ];

  const gateRows = [
    ['gate', 'status', 'summary'],
    ...report.release_gates.map((gate) => [gate.name || '-', gate.status, gate.summary || '-']),
  ];

  const failingLinks = Object.values(report.suites)
    .flatMap((suite) => suite.failures.map((failure) => `${suite.category}: ${failure.file ?? suite.artifact ?? '-'}${failure.line ? `:${failure.line}` : ''} ${failure.message ?? ''}`.trim()));

  return [
    'GALA CI VALIDATION',
    '',
    `state: ${report.state}`,
    `confidence: ${report.confidence}`,
    `commit_summary: ${report.summary80}`,
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
  if (inputPath) {
    if (!fs.existsSync(inputPath)) {
      return {
        reportError: true,
        commitSummary: 'validation input missing',
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
  return {};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = parseArgs(process.argv.slice(2));
  const { report, textPath, jsonPath } = writeReport(readInput(args.input), args.outDir);
  if (args.print) process.stdout.write(renderReportText(report));
  else process.stdout.write(`validation report written: ${textPath} ${jsonPath}\n`);
}
