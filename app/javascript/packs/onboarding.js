/**
 * @noflow
 */

import SpotlightManager from 'shared/spotlight/SpotlightManager'

let unacknowledgedSpotlights = []

if (window.reader) {
  unacknowledgedSpotlights = window.reader.unacknowledgedSpotlights
}

window.spotlightManager = new SpotlightManager(unacknowledgedSpotlights, {
  enabled: false,
})

window.addEventListener('load', () => {
  window.setInterval(() => {
    window.spotlightManager.enabled = true
  }, 1000)
})
