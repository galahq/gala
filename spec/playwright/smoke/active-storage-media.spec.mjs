import { expect, test } from '@playwright/test';

const mediaPath = process.env.GALA_SMOKE_MEDIA_PATH;
const imageUrlPattern = /\.(?:avif|gif|jpe?g|png|webp)(?:[?#]|$)/i;

const activeStorageUrlsOnPage = async (page) => {
  return page.evaluate(() => {
    const urls = new Set();
    const collectActiveStorageUrlsFromValue = (value) => {
      if (!value) {
        return;
      }

      if (typeof value === 'string') {
        const matches = value.matchAll(/(?:https?:\/\/[^"'\s]+)?\/rails\/active_storage\/[^"'\s<)]+/g);

        for (const match of matches) {
          urls.add(new URL(match[0], window.location.origin).href);
        }

        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => collectActiveStorageUrlsFromValue(item));
        return;
      }

      if (typeof value === 'object') {
        Object.values(value).forEach((item) => collectActiveStorageUrlsFromValue(item));
      }
    };

    collectActiveStorageUrlsFromValue(window.caseData);
    document.querySelectorAll('img, meta[property="og:image"], source').forEach((element) => {
      collectActiveStorageUrlsFromValue(element.getAttribute('src'));
      collectActiveStorageUrlsFromValue(element.getAttribute('srcset'));
      collectActiveStorageUrlsFromValue(element.getAttribute('content'));
    });
    collectActiveStorageUrlsFromValue(document.documentElement.innerHTML);

    return Array.from(urls);
  });
};

test.describe('ActiveStorage media smoke', () => {
  test.skip(!mediaPath, 'GALA_SMOKE_MEDIA_PATH is required.');

  test('loads ActiveStorage media without failed image or media responses', async ({ page }) => {
    const activeStorageResponses = [];
    const failedMediaResponses = [];

    page.on('response', (response) => {
      const request = response.request();
      const url = response.url();
      const resourceType = request.resourceType();
      const isActiveStorage = url.includes('/rails/active_storage/');
      const isMediaResource = isActiveStorage || resourceType === 'image' || resourceType === 'media';

      if (isActiveStorage) {
        activeStorageResponses.push({ status: response.status(), url });
      }

      if (isMediaResource && response.status() >= 400) {
        failedMediaResponses.push({ status: response.status(), url });
      }
    });

    const response = await page.goto(mediaPath, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);

    await expect
      .poll(async () => (await activeStorageUrlsOnPage(page)).length, {
        message: 'Expected page to expose ActiveStorage URLs',
        timeout: 10_000,
      })
      .toBeGreaterThan(0);

    const activeStorageUrls = await activeStorageUrlsOnPage(page);
    const imageActiveStorageUrls = activeStorageUrls.filter((url) => imageUrlPattern.test(new URL(url).pathname));

    expect(activeStorageUrls.length).toBeGreaterThan(0);
    expect(imageActiveStorageUrls.length).toBeGreaterThan(0);

    const imageLoaded = await page.evaluate((src) => {
      return new Promise((resolve) => {
        const image = new Image();
        image.alt = 'ActiveStorage smoke';
        image.onload = () => resolve(true);
        image.onerror = () => resolve(false);
        image.src = src;
        document.body.appendChild(image);
      });
    }, imageActiveStorageUrls[0]);

    expect(activeStorageResponses.length).toBeGreaterThan(0);
    expect(failedMediaResponses).toEqual([]);
    expect(imageLoaded, `Expected ActiveStorage image to load: ${imageActiveStorageUrls[0]}`).toBe(true);
  });
});
