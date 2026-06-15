import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const REQUIRED_SUITE_CATEGORIES = [
  'unit',
  'contracts',
  'targeted_rspec',
];
export const OPTIONAL_SUITE_CATEGORIES = ['system'];
export const SUITE_MATRIX_CATEGORIES = [...REQUIRED_SUITE_CATEGORIES, ...OPTIONAL_SUITE_CATEGORIES];
export const REQUIRED_INFRA_CATEGORIES = [];

const SECRET_KEY_PATTERN = /(TOKEN|PASSWORD|SECRET|DATABASE_URL|REDIS_URL|RAILS_MASTER_KEY|PRIVATE_KEY|API_KEY)/i;
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
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

const INFRASTRUCTURE_TERMS = [
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

function redactText(value) {
  return `${value ?? ''}`
    .replace(
      /([A-Z0-9_]*(?:TOKEN|PASSWORD|SECRET|DATABASE_URL|REDIS_URL|RAILS_MASTER_KEY|PRIVATE_KEY|API_KEY)[A-Z0-9_]*\s*[=:]\s*)[^\s,;]+/gi,
      '$1[REDACTED]',
    )
    .replace(EMAIL_PATTERN, '[REDACTED_EMAIL]');
}

function normalizeStatus(status) {
  return STATUS_MAP.get(compact(status).toLowerCase()) ?? 'not_run';
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function unique(values) {
  return Array.from(new Set(values));
}

export function truncateSummary(summary, limit = 80) {
  const clean = compact(redactText(summary)) || 'No commit summary available';
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
  if (typeof value === 'string') return redactText(value);
  return value;
}

export function normalizeSuites(suites = []) {
  const byCategory = new Map();

  for (const suite of Array.isArray(suites) ? suites : []) {
    const category = compact(suite.category).toLowerCase();
    if (!SUITE_MATRIX_CATEGORIES.includes(category)) continue;
    const normalizedStatus = normalizeStatus(suite.status);
    const keepsFailureContext = ['failed', 'error', 'warning'].includes(normalizedStatus);
    byCategory.set(category, {
      category,
      name: compact(redactText(suite.name)) || category,
      command: compact(redactText(suite.command)),
      status: normalizedStatus,
      reason: compact(redactText(suite.reason)),
      summary: compact(redactText(suite.summary)),
      artifactUrl: compact(redactText(suite.artifactUrl || suite.artifact_url)),
      durationMs: numberOrNull(suite.durationMs),
      artifact: compact(redactText(suite.artifact)),
      exitCode: numberOrNull(suite.exitCode),
      timedOut: Boolean(suite.timedOut),
      triage: compact(redactText(suite.triage)),
      failures: keepsFailureContext && Array.isArray(suite.failures)
        ? suite.failures.map((failure) => compact(redactText(failure))).filter(Boolean)
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

function normalizeEvidence(value, fallbackName) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    name: compact(redactText(source.name)) || fallbackName,
    status: normalizeStatus(source.status),
    reason: compact(redactText(source.reason)),
    summary: compact(redactText(source.summary)),
    artifact: compact(redactText(source.artifact)),
    command: compact(redactText(source.command)),
    exitCode: numberOrNull(source.exitCode),
    timedOut: Boolean(source.timedOut),
    rawText: typeof source.rawText === 'string' ? redactText(source.rawText) : '',
  };
}

export function normalizeDockerImageSize(value = {}) {
  const evidence = normalizeEvidence(value, 'docker_image_size');
  const runtimeBaseBytes = numberOrNull(value.runtimeBaseBytes ?? value.runtime_base_bytes);
  let appLayerBytes = numberOrNull(value.appLayerBytes ?? value.app_layer_bytes);
  const productionBytes = numberOrNull(value.productionBytes ?? value.production_bytes);

  if (appLayerBytes === null && runtimeBaseBytes !== null && productionBytes !== null) {
    appLayerBytes = productionBytes - runtimeBaseBytes;
  }

  const hasEquation = runtimeBaseBytes !== null && appLayerBytes !== null && productionBytes !== null;
  return {
    ...evidence,
    runtime_base_bytes: runtimeBaseBytes,
    app_layer_bytes: appLayerBytes,
    production_bytes: productionBytes,
    equation: hasEquation ? `${runtimeBaseBytes} + ${appLayerBytes} = ${productionBytes}` : 'unavailable',
    summary: evidence.summary || (hasEquation ? `${runtimeBaseBytes} + ${appLayerBytes} = ${productionBytes}` : 'unavailable'),
  };
}

function collectJsonMutations(node, entries = []) {
  if (Array.isArray(node)) {
    for (const entry of node) collectJsonMutations(entry, entries);
    return entries;
  }
  if (!node || typeof node !== 'object') return entries;

  const operation = compact(node.operation ?? node.op ?? node.action ?? node.type ?? node.change ?? node.changeType);
  const resource = compact(node.resource ?? node.urn ?? node.name ?? node.logicalId ?? node.id ?? node.address);
  const detail = compact(node.detail ?? node.summary ?? node.message);
  if (operation || resource || detail) {
    entries.push(clip([operation, resource, detail].filter(Boolean).join(' '), 180));
  }

  for (const value of Object.values(node)) collectJsonMutations(value, entries);
  return entries;
}

export function summarizeSstDiffMutation(rawText = '') {
  const text = redactText(rawText);
  if (!compact(text)) return 'no output captured';

  try {
    const parsed = JSON.parse(text);
    const entries = unique(collectJsonMutations(parsed).filter(Boolean));
    if (entries.length > 0) return entries.slice(0, 8).join('; ');
  } catch {
    // Fall through to stable raw-line summary.
  }

  const lines = text.split(/\r?\n/).map(compact).filter(Boolean);
  const mutationLines = lines.filter((line) => /(create|update|delete|destroy|replace|remove|change|\+|-)/i.test(line));
  const selected = (mutationLines.length > 0 ? mutationLines : lines).slice(0, 8);
  return selected.length > 0 ? selected.map((line) => clip(line, 180)).join('; ') : 'no output captured';
}

function detectInfrastructureTerms(input = '', source = 'sst_diff') {
  const text = typeof input === 'string' ? input : JSON.stringify(input ?? '', null, 2);
  const matches = [];

  for (const rawLine of redactText(text).split(/\r?\n/)) {
    const line = compact(rawLine);
    if (!line) continue;
    const lower = line.toLowerCase();
    const term = INFRASTRUCTURE_TERMS.find((candidate) => lower.includes(candidate));
    if (!term) continue;
    matches.push({ term, source, snippet: clip(line, 180) });
  }

  const seen = new Set();
  return matches.filter((match) => {
    const key = `${match.term}\0${match.source}\0${match.snippet}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 12);
}

export function detectDestructiveWarnings(input = '') {
  return detectInfrastructureTerms(input);
}

export function finalState({ suites, infra = {}, reportError = false } = {}) {
  if (reportError) return 'error';
  const requiredSuites = Object.values(suites ?? {})
    .filter((suite) => REQUIRED_SUITE_CATEGORIES.includes(suite.category));
  const requiredInfra = REQUIRED_INFRA_CATEGORIES
    .map((category) => infra?.[category])
    .filter(Boolean);
  const required = [...requiredSuites, ...requiredInfra];
  if (required.some((entry) => entry.status === 'error')) return 'error';
  if (required.some((entry) => ['failed', 'warning', 'not_run'].includes(entry.status))) return 'failure';
  return 'success';
}

export function buildReport(input = {}) {
  const redactedInput = redactSecrets(input);
  const suites = normalizeSuites(redactedInput.suites);
  const sstDiff = {
    ...normalizeEvidence(redactedInput.sstDiff, 'sst_diff'),
  };
  sstDiff.mutation_summary = summarizeSstDiffMutation(sstDiff.rawText || sstDiff.summary || sstDiff.reason);
  const dockerImageSize = normalizeDockerImageSize(redactedInput.dockerImageSize);

  const releaseGates = Array.isArray(redactedInput.releaseGates) && redactedInput.releaseGates.length > 0
    ? redactedInput.releaseGates.map((gate) => ({
        name: compact(redactText(gate.name)),
        status: normalizeStatus(gate.status),
        summary: compact(redactText(gate.summary)),
      }))
    : [
        {
          name: 'deploy_control',
          status: 'passed',
          summary: 'deploy remains operator-driven',
        },
      ];

  const report = {
    generated_at: new Date().toISOString(),
    summary80: truncateSummary(redactedInput.changeset?.summary ?? redactedInput.commitSummary),
    run_context: {
      run_id: compact(redactText(redactedInput.runContext?.runId)),
      run_attempt: compact(redactText(redactedInput.runContext?.runAttempt)),
      run_url: compact(redactText(redactedInput.runContext?.runUrl)),
      event: compact(redactText(redactedInput.runContext?.eventName)),
      actor: compact(redactText(redactedInput.runContext?.actor)),
      repository: compact(redactText(redactedInput.runContext?.repository)),
      pr_number: compact(redactText(redactedInput.runContext?.prNumber)),
      pr_title: compact(redactText(redactedInput.runContext?.prTitle)),
      head_ref: compact(redactText(redactedInput.runContext?.headRef)),
      base_ref: compact(redactText(redactedInput.runContext?.baseRef)),
      head_sha: compact(redactText(redactedInput.runContext?.headSha)),
      base_sha: compact(redactText(redactedInput.runContext?.baseSha)),
      artifacts_url: compact(redactText(redactedInput.runContext?.artifactsUrl)),
    },
    commit_count: Number.isFinite(Number(redactedInput.commitCount)) ? Number(redactedInput.commitCount) : 0,
    changeset: {
      files_changed: Number.isFinite(Number(redactedInput.changeset?.filesChanged)) ? Number(redactedInput.changeset.filesChanged) : 0,
      additions: Number.isFinite(Number(redactedInput.changeset?.additions)) ? Number(redactedInput.changeset.additions) : 0,
      deletions: Number.isFinite(Number(redactedInput.changeset?.deletions)) ? Number(redactedInput.changeset.deletions) : 0,
      summary: truncateSummary(redactedInput.changeset?.summary ?? redactedInput.commitSummary),
    },
    suites,
    infra: {
      sst_diff: sstDiff,
      docker_image_size: dockerImageSize,
    },
    infrastructure_terms: [
      ...detectInfrastructureTerms(sstDiff.rawText || sstDiff.summary || sstDiff.reason, 'sst_diff'),
      ...detectInfrastructureTerms(dockerImageSize.reason || dockerImageSize.summary, 'docker_image_size'),
    ],
    release_gates: releaseGates,
  };

  report.state = finalState({
    suites,
    infra: report.infra,
    reportError: Boolean(redactedInput.reportError),
  });
  return report;
}

function table(rows) {
  const widths = rows[0].map((_, index) => Math.max(...rows.map((row) => `${row[index] ?? ''}`.length)));
  const line = `+${widths.map((width) => '-'.repeat(width + 2)).join('+')}+`;
  const format = (row) => `|${row.map((cell, index) => ` ${`${cell ?? ''}`.padEnd(widths[index])} `).join('|')}|`;
  return [line, format(rows[0]), line, ...rows.slice(1).map(format), line].join('\n');
}

function isRequiredSuite(category) {
  return REQUIRED_SUITE_CATEGORIES.includes(category);
}

function isSuiteReportableFailure(suite) {
  if (['failed', 'error', 'warning'].includes(suite.status)) return true;
  return suite.status === 'not_run' && isRequiredSuite(suite.category);
}

function isInfraReportableFailure(evidence) {
  return evidence && ['failed', 'error', 'warning'].includes(evidence.status);
}

function extractFailureLocations(failures = []) {
  const locationPattern = /(?:^|[\s#(])((?:\.\/)?(?:(?:\.github\/workflows|app|spec|config|lib|db|scripts|infra|docs|test)\/[A-Za-z0-9_./-]+\.(?:rb|js|jsx|ts|tsx|mjs|css|scss|yml|yaml|json|sh|md)|Dockerfile(?:\.[A-Za-z0-9_-]+)?):\d+(?::\d+)?\b)/g;
  const locations = [];
  for (const failure of failures) {
    for (const match of `${failure}`.matchAll(locationPattern)) {
      locations.push(match[1]);
    }
  }
  return unique(locations).slice(0, 12);
}

function makeFailureLocationLink(location, runContext) {
  const match = String(location).match(/^(.+?):(\d+)(?::\d+)?$/);
  if (!match) return location;
  const repository = compact(runContext?.repository || '');
  const sha = compact(runContext?.head_sha || runContext?.base_sha || '');
  if (!repository || !sha) return location;
  const filePath = match[1].replace(/^\.\//, '');
  const line = match[2];
  return `[${filePath}:${line}](https://github.com/${repository}/blob/${sha}/${filePath}#L${line})`;
}

function suiteFailureEntries(report) {
  return Object.values(report.suites)
    .filter(isSuiteReportableFailure)
    .map((suite) => ({
      dimension: suite.category,
      status: suite.status,
      exitCode: suite.exitCode,
      timedOut: suite.timedOut,
      next: suite.triage || suite.command || 'inspect artifact',
      snippet: suite.summary || suite.reason || 'no summary provided',
      artifact: suite.artifactUrl || suite.artifact || '',
      failures: suite.failures ?? [],
    }));
}

function infraFailureEntries(report) {
  return Object.values(report.infra)
    .filter(isInfraReportableFailure)
    .map((evidence) => ({
      dimension: evidence.name,
      status: evidence.status,
      exitCode: evidence.exitCode,
      timedOut: evidence.timedOut,
      next: evidence.command || 'inspect artifact',
      snippet: evidence.reason || evidence.summary || 'no summary provided',
      artifact: evidence.artifact || '',
      failures: [evidence.reason, evidence.summary].filter(Boolean),
    }));
}

export function renderReportText(report) {
  const suiteRows = [
    ['dimension', 'status', 'detail', 'artifact'],
    ...SUITE_MATRIX_CATEGORIES.map((category) => {
      const suite = report.suites[category];
      return [category, suite.status, clip(suite.reason || suite.summary || 'recorded', 96), suite.artifact || '-'];
    }),
    ['sst_diff', report.infra.sst_diff.status, clip(report.infra.sst_diff.reason || report.infra.sst_diff.summary || 'recorded', 96), report.infra.sst_diff.artifact || '-'],
    ['docker_image_size', report.infra.docker_image_size.status, clip(report.infra.docker_image_size.reason || report.infra.docker_image_size.summary || 'recorded', 96), report.infra.docker_image_size.artifact || '-'],
  ];

  const dockerRows = [
    ['field', 'value'],
    ['status', report.infra.docker_image_size.status],
    ['runtime_base_bytes', report.infra.docker_image_size.runtime_base_bytes ?? 'unavailable'],
    ['app_layer_bytes', report.infra.docker_image_size.app_layer_bytes ?? 'unavailable'],
    ['production_bytes', report.infra.docker_image_size.production_bytes ?? 'unavailable'],
    ['equation', report.infra.docker_image_size.equation],
    ['detail', report.infra.docker_image_size.reason || report.infra.docker_image_size.summary || 'recorded'],
    ['artifact', report.infra.docker_image_size.artifact || '-'],
  ];

  const termRows = [
    ['term', 'source', 'snippet'],
    ...(report.infrastructure_terms.length > 0
      ? report.infrastructure_terms.map((term) => [term.term || '-', term.source || '-', term.snippet || '-'])
      : [['none', '-', 'no infrastructure terms matched']]),
  ];

  const gateRows = [
    ['gate', 'status', 'summary'],
    ...report.release_gates.map((gate) => [gate.name || '-', gate.status, gate.summary || '-']),
  ];

  const failureEntries = [...suiteFailureEntries(report), ...infraFailureEntries(report)];
  const failureLinks = failureEntries.flatMap((entry) => {
    const extracted = entry.failures.slice(0, 8).map((failure) => `${entry.dimension}: ${failure}`.trim());
    if (extracted.length > 0) return extracted;
    const link = entry.artifact || '-';
    return [`${entry.dimension}: ${link} ${entry.snippet}`.trim()];
  });

  const failureContextRows = [
    ['dimension', 'status', 'exit', 'timeout', 'next', 'snippet'],
    ...failureEntries.map((entry) => [
      entry.dimension,
      entry.status,
      entry.exitCode ?? '-',
      entry.timedOut ? 'yes' : 'no',
      clip(entry.next, 96),
      clip(entry.snippet, 180),
    ]),
  ];

  const topFailureLines = failureEntries
    .flatMap((entry) => entry.failures.slice(0, 10).map((line) => `- ${entry.dimension}: ${clip(line, 160)}`));

  const failureLocations = failureEntries.flatMap((entry) => extractFailureLocations(entry.failures)
    .map((location) => `- ${entry.dimension}: ${makeFailureLocationLink(location, report.run_context)}`));

  return [
    'GALA CI',
    '',
    `state: ${report.state}`,
    `commit_summary: ${report.summary80}`,
    `run: id=${report.run_context.run_id || '-'} attempt=${report.run_context.run_attempt || '-'} event=${report.run_context.event || '-'} actor=${report.run_context.actor || '-'}`,
    `pr_ref: #${report.run_context.pr_number || '-'} ${report.run_context.head_ref || '-'} -> ${report.run_context.base_ref || '-'} head=${report.run_context.head_sha ? report.run_context.head_sha.slice(0, 8) : '-'}`,
    `run_url: ${report.run_context.run_url || '-'}`,
    `commit_count: ${report.commit_count}`,
    `changeset: files=${report.changeset.files_changed} additions=${report.changeset.additions} deletions=${report.changeset.deletions}`,
    '',
    'test_and_infra_matrix:',
    table(suiteRows),
    '',
    'sst_diff_mutation:',
    `- ${report.infra.sst_diff.mutation_summary || 'no output captured'}`,
    '',
    'docker_image_size:',
    table(dockerRows),
    '',
    'infrastructure_terms:',
    table(termRows),
    '',
    'release_gates:',
    table(gateRows),
    '',
    'failure_links:',
    ...(failureLinks.length ? failureLinks.map((link) => `- ${link}`) : ['- none']),
    '',
    'failure_context:',
    failureContextRows.length > 1 ? table(failureContextRows) : '- none',
    '',
    'top_failure_lines:',
    ...(topFailureLines.length ? topFailureLines : ['- none']),
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
        sstDiff: {
          status: 'not_run',
          reason: `input file not found: ${inputPath}`,
        },
        dockerImageSize: {
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
