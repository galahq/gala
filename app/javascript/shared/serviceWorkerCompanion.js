/**
 * @flow
 */

export function registerServiceWorker (slug: string) {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register(`/cases/${slug}/case_service_worker.js`)
  }
}
