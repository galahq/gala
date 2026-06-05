import { expect, test } from '@playwright/test';

const smokeEmail = process.env.GALA_SMOKE_READER_EMAIL;
const smokeLoginValue = process.env.GALA_SMOKE_READER_PASSWORD;

async function acceptTermsIfPrompted(page) {
  const termsCheckbox = page.locator('input[name="reader[terms_of_service]"]');
  if (await termsCheckbox.count() === 0) {
    return;
  }

  await termsCheckbox.check({ force: true });
  await Promise.all([
    page.waitForURL((url) => !/\/readers\/\d+\/edit_tos/.test(url.pathname), {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    }).catch(() => null),
    page.getByRole('button', { name: /^Continue$/i }).click(),
  ]);
}

async function signIn(page) {
  await page.goto('/readers/sign_in', { waitUntil: 'domcontentloaded' });

  if (!/\/readers\/sign_in$/.test(new URL(page.url()).pathname)) {
    await acceptTermsIfPrompted(page);
    return;
  }

  await page.getByLabel(/^Email$/i).fill(smokeEmail);
  await page.getByLabel(/^Password$/i).fill(smokeLoginValue);

  await Promise.all([
    page.waitForURL((url) => !/\/readers\/sign_in$/.test(url.pathname), {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    }).catch(() => null),
    page.locator('form input[type="submit"][value="Sign in"]').click(),
  ]);

  if (/\/readers\/sign_in$/.test(new URL(page.url()).pathname)) {
    throw new Error('Smoke reader was not signed in; check CI smoke credentials.');
  }

  await acceptTermsIfPrompted(page);
}

async function fetchProfileInBrowser(page) {
  return page.evaluate(async () => {
    const response = await fetch('/profile.json', {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await response.json() : null;

    return {
      status: response.status,
      contentType,
      body,
    };
  });
}

test.describe('authenticated catalog smoke', () => {
  test.skip(
    !smokeEmail || !smokeLoginValue,
    'GALA_SMOKE_READER_EMAIL and GALA_SMOKE_READER_PASSWORD are required.'
  );

  test('renders the catalog as signed in after an anonymous catalog visit', async ({ page }) => {
    const anonymousResponse = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(anonymousResponse?.status()).toBeLessThan(400);
    await expect.poll(() => page.evaluate(() => window.reader == null)).toBe(true);

    await signIn(page);

    const catalogResponse = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(catalogResponse?.status()).toBe(200);

    const cacheControl = catalogResponse?.headers()['cache-control'] || '';
    expect(cacheControl).toMatch(/\bprivate\b/);
    expect(cacheControl).toMatch(/\bno-store\b/);
    expect(cacheControl).not.toMatch(/\bpublic\b/);
    expect(cacheControl).not.toMatch(/\bs-maxage\b/);

    await expect.poll(() => page.evaluate(() => window.reader != null)).toBe(true);
    await expect(page.getByText('Welcome back')).toBeVisible();
    await expect(page.getByRole('button', { name: /^Sign in$/i })).toBeHidden();

    const profile = await fetchProfileInBrowser(page);
    expect(profile.status).toBe(200);
    expect(profile.contentType).toContain('application/json');
    expect(profile.body?.email).toBe(smokeEmail);
  });
});
