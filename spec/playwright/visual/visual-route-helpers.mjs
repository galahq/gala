import fs from 'node:fs';
import path from 'node:path';

const ROUTES_PATH = path.resolve(process.cwd(), 'config', 'routes.rb');
const ROUTES_RB = fs.readFileSync(ROUTES_PATH, 'utf8');
const NOISE_ALLOWLIST_PATH = path.resolve(process.cwd(), 'spec/playwright/visual/noise-allowlist.json');
const NOISE_ALLOWLIST = JSON.parse(fs.readFileSync(NOISE_ALLOWLIST_PATH, 'utf8'));

export const FALLBACK_CASE_SLUG = 'mi-wolves/translations/fr';
export const FALLBACK_CASE_SLUG_ENV = process.env.VISUAL_CASE_SLUG;
export const VIEWPORTS = [
  { width: 1366, height: 768, label: 'desktop' },
  { width: 375, height: 812, label: 'mobile' },
];

const ROUTE_DEFINITIONS = [
  { path: '/', routeCheck: 'root to:', name: 'root', auth: 'public' },
  { path: '/catalog', routeCheck: "namespace 'catalog'", name: 'catalog', auth: 'public' },
  { path: '/cases', routeCheck: 'resources :cases', name: 'cases-index', auth: 'public' },
  { path: '/cases/:slug/*', routeCheck: 'resources :cases', name: 'case-detail', auth: 'public' },
  { path: '/search', routeCheck: 'resources :search', name: 'search', auth: 'public' },
  { path: '/profile', routeCheck: 'resource :profile', name: 'profile', auth: 'reader' },
  { path: '/my_cases', routeCheck: 'resources :my_cases', name: 'my-cases', auth: 'reader' },
  { path: '/reading_lists', routeCheck: 'resources :reading_lists', name: 'reading-lists', auth: 'reader' },
  { path: '/admin', routeCheck: 'namespace :admin', name: 'admin', auth: 'editor', allowAuthFailure: true },
  { path: '/admin/cases', routeCheck: 'namespace :admin', name: 'admin-cases', auth: 'editor', allowAuthFailure: true },
];

function routeVisibleInRoutes(route) {
  return route.routeCheck ? ROUTES_RB.includes(route.routeCheck) : true;
}

function routeAllowlist(routePath) {
  return (
    NOISE_ALLOWLIST.routes.find((entry) => entry.path === routePath) || {
      console: [],
      network: [],
      status: [],
    }
  );
}

export function buildRouteMatrix() {
  const caseRoutes = ROUTE_DEFINITIONS.map((route) => ({
    ...route,
    safeName: route.name,
  })).filter(routeVisibleInRoutes);

  return caseRoutes;
}

function sanitizeCaseSlug(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  return trimmed || null;
}

export async function inferCaseRoute(page) {
  const explicit = sanitizeCaseSlug(FALLBACK_CASE_SLUG_ENV);
  if (explicit) {
    return explicit;
  }

  await page.goto('/cases', { waitUntil: 'domcontentloaded' });

  const pageSlug = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href*="/cases/"]'));
    for (const anchor of anchors) {
      const href = anchor.getAttribute('href');
      if (!href) {
        continue;
      }

      const normalized = href.replace(/^https?:\/\/[^/]+/, '').replace(/\?.*/, '').replace(/\/+$/, '');
      if (normalized.startsWith('/cases/') && !normalized.match(/\bcases\/?$/)) {
        return normalized;
      }
    }
    return null;
  });

  return sanitizeCaseSlug(pageSlug) || FALLBACK_CASE_SLUG;
}

export function resolveCaseRoute(routePath, caseSlug) {
  if (routePath === '/cases/:slug/*') {
    const normalized = sanitizeCaseSlug(caseSlug) || FALLBACK_CASE_SLUG;
    return `/cases/${normalized}`;
  }

  return routePath;
}

export function routeViewports() {
  return VIEWPORTS;
}

export async function extractAuthToken(page) {
  const meta = await page.$('meta[name="csrf-token"]');
  if (meta) {
    return (await meta.getAttribute('content')) || '';
  }

  const tokenInput = await page.$('input[name="authenticity_token"]');
  return tokenInput ? (await tokenInput.getAttribute('value')) || '' : '';
}

export async function signInReader(page, { role = 'reader' } = {}) {
  const email = process.env[`VISUAL_${role.toUpperCase()}_EMAIL`];
  const password = process.env[`VISUAL_${role.toUpperCase()}_PASSWORD`];

  if (!email || !password) {
    return false;
  }

  await page.goto('/readers/sign_in', { waitUntil: 'domcontentloaded' });
  const token = await extractAuthToken(page);

  const response = await page.request.post('/readers/sign_in', {
    form: {
      'authenticity_token': token,
      'reader[email]': email,
      'reader[password]': password,
      remember_me: '1',
      commit: 'Log in',
    },
    maxRedirects: 0,
  });

  if (!response.ok()) {
    return false;
  }

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  return true;
}

export async function ensureSignedOut(page) {
  await page.context().clearCookies();
  try {
    await page.request.get('/readers/sign_out');
  } catch {
    // Sign out is best effort in case the route changes or auth is already absent.
  }
  await page.goto('/', { waitUntil: 'domcontentloaded' }).catch(() => {});
}

function normalizeForMatch(value) {
  return `${value}`.trim();
}

function matchesAllowed(value, patterns = []) {
  const normalized = normalizeForMatch(value);
  return patterns.some((pattern) => {
    if (!pattern || typeof pattern !== 'string') {
      return false;
    }

    try {
      return new RegExp(pattern).test(normalized);
    } catch {
      return normalized.includes(pattern);
    }
  });
}

export function createNoiseRegistry(routePath) {
  const allowlist = routeAllowlist(routePath);
  return {
    console: allowlist.console,
    network: allowlist.network,
    status: allowlist.status,
    unknownConsole: [],
    unknownNetwork: [],
    failingResponses: [],
  };
}

export function classifyConsoleMessage(message, allowlist) {
  const normalized = `${message.type()}: ${message.text()}`;
  return matchesAllowed(normalized, allowlist.console) ? 'allowed' : 'unknown';
}

export function classifyRequest(request, response, allowlist) {
  const status = response?.status?.() || 0;

  if (status >= 500 || status < 100) {
    return 'failure';
  }

  const normalized = `${request.method()} ${status} ${request.resourceType()} ${request.url()}`;
  const isStatusAllowed = matchesAllowed(status.toString(), allowlist.status);
  const isUrlAllowed = matchesAllowed(request.url(), allowlist.network);

  if (isStatusAllowed || isUrlAllowed || matchesAllowed(normalized, allowlist.network)) {
    return 'allowed';
  }

  return 'unknown';
}

export function failIfUnknownNoise(collected) {
  const errors = [...collected.unknownConsole, ...collected.unknownNetwork, ...collected.failingResponses];
  if (errors.length > 0) {
    throw new Error(`Unknown visual noise detected:\n${errors.join('\n')}`);
  }
}
