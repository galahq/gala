/**
 * Records, and lets the visitor change, the answer to the consent banner.
 *
 * The cookie is the record of the choice itself, so it is strictly necessary
 * and is written whichever way they answer. ConsentHelper reads it on the next
 * request, which is why accepting and reopening both reload: the server, not
 * this file, decides what a consented page looks like.
 */

import { Controller } from 'stimulus'

// A year. Consent is not forever, and this is the usual interval for asking
// again.
const MAX_AGE = 365 * 24 * 60 * 60

export default class extends Controller {
  accept () {
    this.write('granted', MAX_AGE)

    // Reload rather than calling ahoy.start() by hand, so everything gated on
    // consent initialises by its normal path instead of a second one that only
    // ever runs on this click.
    window.location.reload()
  }

  decline () {
    this.write('denied', MAX_AGE)

    // Withdrawing has to remove what was already stored, not just stop more
    // being stored. ahoy.reset() destroys ahoy_visit, ahoy_visitor,
    // ahoy_events and ahoy_track.
    if (window.ahoy && typeof window.ahoy.reset === 'function') {
      window.ahoy.reset()
    }

    this.element.remove()
  }

  // Clears the decision so the banner comes back, leaving the existing
  // consent in force until they actually change it.
  reopen (event) {
    if (event) event.preventDefault()

    this.write('', 0)
    window.location.reload()
  }

  write (decision, maxAge) {
    const secure = window.location.protocol === 'https:' ? '; secure' : ''
    document.cookie =
      `gala_consent=${decision}; path=/; max-age=${maxAge}; samesite=lax${secure}`
  }
}
