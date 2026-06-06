import { test, expect } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
const routes = [
  { id: 'content-root', group: 'content', name: 'root', path: '/' },
  { id: 'content-case_library_requests', group: 'content', name: 'case_library_requests', path: '/case_library_requests' },
  { id: 'content-cases', group: 'content', name: 'cases', path: '/cases' },
  { id: 'content-features', group: 'content', name: 'features', path: '/cases/features' },
  { id: 'content-catalog', group: 'content', name: 'catalog', path: '/catalog/*react_router_location' },
  { id: 'content-catalog_languages', group: 'content', name: 'catalog_languages', path: '/catalog/languages' },
  { id: 'content-my_cases', group: 'content', name: 'my_cases', path: '/my_cases' },
]

test.describe('p8t visual route tape', () => {
  for (const route of routes) {
    test(`${route.group}: ${route.name || route.path}`, async ({ page }) => {
      await page.goto(new URL(route.path, baseURL).toString(), { waitUntil: 'networkidle' })
      await expect(page).toHaveScreenshot(`${route.id}.png`, {
        fullPage: true,
        animations: 'disabled',
      })
    })
  }
})
