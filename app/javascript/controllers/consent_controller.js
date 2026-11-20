/**
 * Records, and lets the visitor change, the answer to the consent banner.
 *
 * The decision cookie is the record of the choice itself, so it is strictly
 * necessary and is written whichever way they answer. The Consent concern
 * reads it on the next request, which is why every path here reloads: the
 * server, not this file, decides what a consented page looks like.
 */

import { Controller } from 'stimulus'

// A year. Consent is not forever, and this is the usual interval for asking
// again.
const MAX_AGE = 365 * 24 * 60 * 60

export default class extends Controller {
  accept () {
    this.write('gala_consent', 'granted', MAX_AGE)
    this.closeReopened()

    window.location.reload()
  }

  decline () {
    this.write('gala_consent', 'denied', MAX_AGE)
    this.closeReopened()

    // Withdrawing has to remove what was already stored, not merely stop more
    // being stored. ahoy.reset() destroys ahoy_visit, ahoy_visitor,
    // ahoy_events and ahoy_track.
    if (window.ahoy && typeof window.ahoy.reset === 'function') {
      window.ahoy.reset()
    }

    // Reload rather than just hiding the banner: someone who had accepted may
    // have maps mounted and Ahoy running, and only a fresh render takes the
    // Mapbox token away and puts the withdrawal link in the footer.
    window.location.reload()
  }

  /**
   * Shows the question again WITHOUT withdrawing the answer. Deleting the
   * decision here would quietly un-consent anyone who clicked only to look,
   * and leave them unanswered if they navigated away. A session cookie says
   * "show the banner"; whatever they chose stays in force until they choose
   * something else.
   */
  reopen (event) {
    if (event) event.preventDefault()

    this.write('gala_consent_reopen', '1', null)
    window.location.reload()
  }

  closeReopened () {
    this.write('gala_consent_reopen', '', 0)
  }

  write (name, value, maxAge) {
    const secure = window.location.protocol === 'https:' ? '; secure' : ''
    const age = maxAge === null ? '' : `; max-age=${maxAge}`
    document.cookie = `${name}=${value}; path=/${age}; samesite=lax${secure}`
  }
}
