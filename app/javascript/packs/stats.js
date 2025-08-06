/**
 * @noflow
 */

import React from 'react'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

import StatsPage from 'cases/StatsPage'

// Import BlueprintJS styles
import '@blueprintjs/core/lib/css/blueprint.css'

function initStats() {
  const container = document.getElementById('stats-container')
  
  if (container) {
    const caseSlug = window.caseSlug
    
    if (!caseSlug) {
      console.error('Case slug not found')
      return
    }

    try {
      ReactDOM.render(
        <IntlProvider locale="en">
          <StatsPage caseSlug={caseSlug} />
        </IntlProvider>,
        container
      )
    } catch (error) {
      console.error('Error rendering StatsPage component:', error)
    }
  }
}

// Try immediate execution
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStats)
} else {
  initStats()
}

// Also try with a timeout as fallback
setTimeout(initStats, 1000) 