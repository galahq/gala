/** @jsx React.createElement */
/*  */

import { Controller } from 'stimulus'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { IntlProvider } from 'react-intl'

import loadMessages from '../../../config/locales'
import ErrorBoundary from '../utility/ErrorBoundary'
import StatsPage from '../stats/StatsPage'

/**
 * Mounts the StatsPage React component and subscribes to StatsChannel
 * for real-time updates when new Ahoy events are created.
 */
export default class extends Controller {
  subscription = null
  root = null
  dataUrl
  caseId
  minDate

  connect () {
    const { url, caseId, minDate } = this.element.dataset
    this.dataUrl = url
    this.caseId = caseId
    this.minDate = minDate

    this.subscribeToChannel()
    this.mountStatsPage()
  }

  disconnect () {
    if (this.subscription) {
      this.subscription.unsubscribe()
      this.subscription = null
    }
    if (this.root) {
      this.root.unmount()
      this.root = null
    }
  }

  subscribeToChannel () {
    if (this.subscription || !this.caseId) return
    if (!window.App?.cable) return

    this.subscription = App.cable.subscriptions.create(
      { channel: 'StatsChannel', case_id: this.caseId },
      { received: (data) => this.handleReceived(data) }
    )
  }

  handleReceived (data) {
    if (data.type === 'stats_updated') {
      this.refreshOverview()
    }
  }

  async refreshOverview () {
    const overviewElement = document.getElementById('stats-overview')
    if (!overviewElement) return

    try {
      const response = await fetch(`${this.dataUrl}/overview`, {
        headers: { Accept: 'text/html' },
        credentials: 'include',
      })
      if (response.ok) {
        overviewElement.innerHTML = await response.text()
      }
    } catch (error) {
      console.error('Failed to refresh stats overview:', error)
    }
  }

  mountStatsPage () {
    const locale = window.i18n?.locale || 'en'

    loadMessages(locale)
      .then((messages) => {
        this.root = createRoot(this.element)
        this.root.render(
          <ErrorBoundary>
            <IntlProvider locale={locale} messages={messages}>
              <StatsPage dataUrl={this.dataUrl} minDate={this.minDate} />
            </IntlProvider>
          </ErrorBoundary>
        )
      })
      .catch((error) => {
        console.error('Failed to mount StatsPage:', error)
        if (this.root) {
          this.root.unmount()
          this.root = null
        }
      })
  }
}
