import { test, expect } from '@playwright/test';
import {
  buildRouteMatrix,
  inferCaseRoute,
  resolveCaseRoute,
  routeViewports,
  signInReader,
  ensureSignedOut,
  createNoiseRegistry,
  classifyConsoleMessage,
  classifyRequest,
  failIfUnknownNoise,
} from './visual-route-helpers.mjs';

const BASELINE_OPTIONS = {
  animations: 'disabled',
  caret: 'hide',
  maxDiffPixels: 0,
  threshold: 0.05,
  fullPage: true,
};

function screenshotName(route, viewport) {
  const safe = route.safeName
    .replace(/[^a-z0-9-]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${safe}-${viewport.label}.png`;
}

async function captureRoute(page, route) {
  const noise = createNoiseRegistry(route.path);
  const masks = route.maskedSelectors || [];

  const handleConsole = (message) => {
    const status = classifyConsoleMessage(message, { console: noise.console });
    if (status === 'unknown') {
      noise.unknownConsole.push(`console:${message.type()}:${message.text()}`);
    }
  };

  const handlePageError = (error) => {
    noise.unknownConsole.push(`pageerror:${error.message}`);
  };

  const handleResponse = async (response) => {
    const request = response.request();
    const status = classifyRequest(request, response, {
      network: noise.network,
      status: noise.status,
    });

    if (status === 'failure') {
      noise.failingResponses.push(`response:${response.status()}:${request.url()}`);
    }

    if (status === 'unknown') {
      noise.unknownNetwork.push(`response:${response.status()}:${request.url()}`);
    }
  };

  page.on('console', handleConsole);
  page.on('pageerror', handlePageError);
  page.on('response', handleResponse);

  try {
    await page.goto(route.path, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    for (const selector of masks) {
      await page.addStyleTag({ content: `${selector} { visibility: hidden !important; }` }).catch(() => {});
    }

    for (const viewport of routeViewports()) {
      await page.setViewportSize(viewport);
      await expect(page.locator('body')).toHaveScreenshot(screenshotName(route, viewport), BASELINE_OPTIONS);
    }
  } finally {
    page.removeListener('console', handleConsole);
    page.removeListener('pageerror', handlePageError);
    page.removeListener('response', handleResponse);
  }

  failIfUnknownNoise(noise);
  return noise;
}

test('visual route coverage from route surface', async ({ page }) => {
  const routes = await buildRouteMatrix();
  const fallbackSlug = await inferCaseRoute(page);

  const summary = {
    captured: [],
    allowedAuthFailures: [],
    unknownNoise: [],
    fallbackCaseSlug: fallbackSlug,
  };

  for (const route of routes) {
    let didAuth = false;

    await ensureSignedOut(page);
    if (route.auth === 'editor') {
      didAuth = await signInReader(page, { role: 'editor' });
      summary.allowedAuthFailures.push({ route: route.path, type: route.auth, authenticated: didAuth });
    } else if (route.auth === 'reader') {
      didAuth = await signInReader(page, { role: 'reader' });
      summary.allowedAuthFailures.push({ route: route.path, type: route.auth, authenticated: didAuth });
    }

    const canCapture = route.auth === 'public' || didAuth || route.allowAuthFailure;
    if (!canCapture) {
      throw new Error(`Could not authenticate for protected route ${route.path}`);
    }

    const normalizedRoute = resolveCaseRoute(route.path, fallbackSlug);

    const observedRoute = {
      ...route,
      path: normalizedRoute,
    };

    try {
      const noise = await captureRoute(page, observedRoute);
      summary.captured.push({ route: route.path, status: 'captured', authenticated: didAuth || false, noise });
    } catch (error) {
      summary.unknownNoise.push({ route: route.path, error: String(error) });
      throw error;
    } finally {
      await ensureSignedOut(page);
    }
  }

  expect(summary.unknownNoise.length, 'No unknown noise should be observed').toBe(0);
});
