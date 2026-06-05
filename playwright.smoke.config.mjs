import { defineConfig, devices } from '@playwright/test';

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ||
  process.env.GALA_CI_SMOKE_URL ||
  process.env.SYSTEM_SMOKE_URL ||
  'http://localhost:3000';

const outputDir = process.env.PLAYWRIGHT_OUTPUT_DIR || 'spec/test-results/smoke';
const htmlReport = process.env.PLAYWRIGHT_HTML_REPORT || 'spec/playwright-report/smoke';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default defineConfig({
  testDir: './spec/playwright/smoke',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: htmlReport }]],
  outputDir,
  timeout: 90000,
  expect: {
    timeout: 15000,
  },
  use: {
    baseURL,
    browserName: 'chromium',
    headless: true,
    viewport: { width: 1366, height: 768 },
    ignoreHTTPSErrors: true,
    actionTimeout: 15000,
    navigationTimeout: 30000,
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    video: 'off',
    permissions: [],
    reducedMotion: 'reduce',
    colorScheme: 'light',
    locale: 'en',
    timezoneId: 'America/Detroit',
  },
  projects: [
    {
      name: 'chromium-smoke',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--disable-dev-shm-usage',
            '--disable-popup-blocking',
            '--no-sandbox',
          ],
        },
      },
    },
  ],
});
