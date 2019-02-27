/**
 * @noflow
 */

import SpotlightManager from 'shared/spotlight/SpotlightManager'

let unacknowledgedSpotlights = []

if (window.reader) {
  unacknowledgedSpotlights = window.reader.unacknowledgedSpotlights
}

window.spotlightManager = new SpotlightManager(unacknowledgedSpotlights)
