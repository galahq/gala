/**
 * 
 */

import SpotlightManager from 'shared/spotlight/SpotlightManager'
import { initPosthogAnalytics, identifyReader } from 'shared/analytics'

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

if (initPosthogAnalytics() && window.reader) {
  identifyReader(window.reader)
}
