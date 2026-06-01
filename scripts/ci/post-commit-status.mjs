import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

export const STATUS_CONTEXT = 'gala/ci-validation';
const ALLOWED_STATES = new Set(['error', 'failure', 'pending', 'success']);

function compact(value) {
  return `${value ?? ''}`.replace(/\s+/g, ' ').trim();
}

function truncate(value, limit = 140) {
  const clean = compact(value);
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, Math.max(0, limit - 3))}...`;
}

export function buildStatusPayload({
  state,
  targetUrl,
  description,
  context = STATUS_CONTEXT,
}) {
  const normalizedState = compact(state).toLowerCase();
  if (!ALLOWED_STATES.has(normalizedState)) {
    throw new Error(`Unsupported commit status state: ${state}`);
  }
  return {
    state: normalizedState,
    target_url: compact(targetUrl),
    description: truncate(description || `Gala CI validation ${normalizedState}`),
    context,
  };
}

export function payloadFromReport(report, targetUrl) {
  const failedSuites = Object.values(report.suites ?? {}).filter((suite) => suite.status === 'failed').length;
  const notRunSuites = Object.values(report.suites ?? {}).filter((suite) => suite.status === 'not_run').length;
  return buildStatusPayload({
    state: report.state ?? 'error',
    targetUrl,
    description: `${report.state ?? 'error'}: failed=${failedSuites} not_run=${notRunSuites} warnings=${report.destructive_warnings?.length ?? 0} confidence=${report.confidence ?? 'n/a'}`,
  });
}

export function resolveStatusSha(env = process.env, explicitSha = '') {
  return compact(explicitSha || env.CI_STATUS_SHA || env.PR_HEAD_SHA || env.GITHUB_SHA);
}

export async function postCommitStatus({
  ownerRepo,
  sha,
  credential,
  apiUrl = 'https://api.github.com',
  payload,
  strict = false,
}) {
  if (!ownerRepo || !sha || !credential) {
    const message = 'Commit status not posted: missing repository, sha, or status permission.';
    if (strict) throw new Error(message);
    return { posted: false, status: 0, message };
  }

  const response = await fetch(`${apiUrl.replace(/\/$/, '')}/repos/${ownerRepo}/statuses/${sha}`, {
    method: 'POST',
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${credential}`,
      'content-type': 'application/json',
      'x-github-api-version': '2022-11-28',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    const message = `Commit status not posted: GitHub API returned ${response.status}. ${body.slice(0, 300)}`;
    if (strict) throw new Error(message);
    return { posted: false, status: response.status, message };
  }

  return { posted: true, status: response.status, message: 'commit status posted' };
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--state') args.state = argv[++index];
    else if (arg === '--target-url') args.targetUrl = argv[++index];
    else if (arg === '--description') args.description = argv[++index];
    else if (arg === '--context') args.context = argv[++index];
    else if (arg === '--report') args.report = argv[++index];
    else if (arg === '--sha') args.sha = argv[++index];
    else if (arg === '--strict') args.strict = true;
  }
  return args;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = parseArgs(process.argv.slice(2));
  const targetUrl = args.targetUrl || `${process.env.GITHUB_SERVER_URL ?? 'https://github.com'}/${process.env.GITHUB_REPOSITORY ?? ''}/actions/runs/${process.env.GITHUB_RUN_ID ?? ''}`;
  let payload;

  if (args.report && fs.existsSync(args.report)) {
    payload = payloadFromReport(JSON.parse(fs.readFileSync(args.report, 'utf8')), targetUrl);
  } else if (args.report) {
    payload = buildStatusPayload({
      state: 'error',
      targetUrl,
      description: 'error: validation report artifact was unavailable',
    });
  } else {
    payload = buildStatusPayload({
      state: args.state || 'pending',
      targetUrl,
      description: args.description,
      context: args.context,
    });
  }

  const result = await postCommitStatus({
    ownerRepo: process.env.GITHUB_REPOSITORY,
    sha: resolveStatusSha(process.env, args.sha),
    credential: process.env.GITHUB_TOKEN,
    apiUrl: process.env.GITHUB_API_URL,
    payload,
    strict: args.strict || process.env.CI_STATUS_STRICT === '1',
  });

  process.stdout.write(`${result.message}\n`);
}
