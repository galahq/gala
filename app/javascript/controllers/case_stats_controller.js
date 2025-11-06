/** @jsx React.createElement */
/* @flow */

import { Controller } from 'stimulus'
import React from 'react'
import ReactDOM from 'react-dom'
import { NonIdealState, Spinner, Card } from '@blueprintjs/core'
import { IntlProvider, FormattedMessage } from 'react-intl'
import asyncComponent from '../utility/asyncComponent'
import loadMessages from '../../../config/locales'
import { StatsSummarySkeleton } from '../stats/StatsSummary'
import { StatsDateRangePickerSkeleton } from '../stats/StatsDateRangePicker'

// Lazy load components for better initial bundle size
const StatsDateRangePicker = asyncComponent(() =>
  import('../stats/StatsDateRangePicker').then(m => m.default)
)
const StatsMap = asyncComponent(() =>
  import('../stats/StatsMap').then(m => m.default)
)
const StatsTable = asyncComponent(() =>
  import('../stats/StatsTable').then(m => m.default)
)
const StatsSummary = asyncComponent(() =>
  import('../stats/StatsSummary').then(m => m.default)
)

// Get locale from window.i18n (set by Rails)
const locale = (window.i18n && window.i18n.locale) || 'en'

export default class extends Controller {
  static targets = ['from', 'to']

  /**
   * Initialize the case stats controller
   * Sets up the date range picker and loads initial data
   */
  connect () {
    // Prevent multiple connections
    if (this.isConnected) {
      return
    }
    this.isConnected = true

    // Prevent recursive calls during initialization
    this.isInitializing = true
    this.isFetching = false
    this.lastRangeChange = 0
    const dataUrl = this.element.dataset.url
    this.publishedAt = this.element.dataset.published_at

    this.dataUrl = dataUrl

    // Load i18n messages and initialize
    loadMessages(locale)
      .then(messages => {
        this.messages = messages
        this.initializeDatePicker()
        this.initializeEventListeners()
      })
      .catch(() => {
        // Fallback to empty messages on error
        this.messages = {}
        this.initializeDatePicker()
        this.initializeEventListeners()
      })
  }

  initializeDatePicker () {
    // Mount React DateRangePicker once (outside controller element)
    const pickerEl = document.getElementById('stats-range-picker')
    if (pickerEl && !pickerEl.dataset.reactMounted) {
      try {
        // Show skeleton first to prevent layout shift
        ReactDOM.render(<StatsDateRangePickerSkeleton />, pickerEl)

        const minDate = this.publishedAt
          ? new Date(this.publishedAt)
          : new Date()
        const maxDate = new Date()

        // Then render the actual picker (asyncComponent will handle the transition)
        ReactDOM.render(
          <IntlProvider locale={locale} messages={this.messages}>
            <StatsDateRangePicker
              className="pt"
              minDate={minDate}
              maxDate={maxDate}
              fromInputId="stats-from"
              toInputId="stats-to"
              initialShortcutIndex={0}
            />
          </IntlProvider>,
          pickerEl
        )
        pickerEl.dataset.reactMounted = '1'
      } catch (error) {
        console.error('Error mounting DateRangePicker:', error)
      }
    }
  }

  initializeEventListeners () {
    // Set up event listener with guard against recursive calls and debouncing
    this.rangeChangedHandler = () => {
      const now = Date.now()
      // Debounce: ignore events that come too quickly (within 500ms to be more conservative)
      if (now - this.lastRangeChange < 500) return
      this.lastRangeChange = now

      // Don't respond to events during initialization or while already fetching
      if (this.isInitializing || this.isFetching) {
        return
      }

      // Call apply directly without timeout to prevent potential race conditions
      this.apply()
    }

    // Show loading state immediately before initial data fetch
    this.renderLoading()

    // Load initial dataset before setting up event listener
    this.fetchAndRenderBoth()
      .then(() => {
        // Only set up the event listener after initial load completes
        this.isInitializing = false
        document.addEventListener(
          'stats-range-changed',
          this.rangeChangedHandler
        )
      })
      .catch(error => {
        console.error('Initial data load failed:', error)
        this.isInitializing = false
        document.addEventListener(
          'stats-range-changed',
          this.rangeChangedHandler
        )
      })
  }

  /**
   * Apply date range changes and fetch new data
   * Validates dates and updates URL parameters
   */
  apply () {
    // Prevent overlapping requests
    if (this.isFetching) {
      return
    }

    try {
      // Enforce date constraints: from >= published_at, from <= to
      if (this.fromTarget && this.publishedAt) {
        if (this.fromTarget.value < this.publishedAt) {
          this.fromTarget.value = this.publishedAt
        }
      }
      if (this.fromTarget && this.toTarget && this.toTarget.value) {
        if (this.fromTarget.value > this.toTarget.value) {
          this.toTarget.value = this.fromTarget.value
        }
      }
      // Ensure "to" does not exceed today
      if (this.toTarget) {
        const today = new Date()
        const yyyy = today.getFullYear()
        const mm = String(today.getMonth() + 1).padStart(2, '0')
        const dd = String(today.getDate()).padStart(2, '0')
        const todayStr = yyyy + '-' + mm + '-' + dd
        if (this.toTarget.value > todayStr) {
          this.toTarget.value = todayStr
        }
      }
      // Sync URL query params (?from=YYYY-MM-DD&to=YYYY-MM-DD)
      const url = new URL(window.location.href)
      const params = url.searchParams
      const from = this.fromTarget && this.fromTarget.value
      const to = this.toTarget && this.toTarget.value
      if (from) params.set('from', from)
      else params.delete('from')
      if (to) params.set('to', to)
      else params.delete('to')
      window.history.replaceState(
        {},
        '',
        url.pathname + '?' + params.toString()
      )
      this.fetchAndRenderBoth()
    } catch (error) {
      console.error('Error in apply method:', error)
      this.isFetching = false // Reset flag on error
    }
  }

  isoDate (d) {
    // Normalize to UTC date string to match values written by the picker
    // (StatsDateRangePicker writes hidden inputs via toISOString().slice(0, 10))
    return d ? d.toISOString().slice(0, 10) : ''
  }

  /**
   * Fetch stats data and render all components
   * Handles loading states, errors, and timeouts
   */
  async fetchAndRenderBoth () {
    // Prevent overlapping requests
    if (this.isFetching) return

    this.isFetching = true
    this.renderLoading()

    try {
      // Add shorter timeout to prevent hanging (15 seconds instead of 30)
      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(
          () => reject(new Error('Request timed out after 15 seconds')),
          15000
        )
      })

      const data = await Promise.race([this.fetchData(), timeoutPromise])
      this.renderResults(data)
    } catch (error) {
      console.error('fetchAndRenderBoth error:', error)
      this.renderError(error)
    } finally {
      this.isFetching = false
    }
  }

  renderLoading () {
    // Show loading spinner in map area
    const mapEl = document.getElementById('stats-map')
    if (mapEl) {
      try {
        // Don't unmount the map component during loading - let it handle its own loading state
        // Just show a loading overlay on top of the existing map
        const existingOverlay = mapEl.querySelector('.loading-overlay')
        if (!existingOverlay) {
          // Create overlay using React for consistency
          const overlayDiv = document.createElement('div')
          overlayDiv.className = 'loading-overlay'
          mapEl.style.position = 'relative'
          mapEl.appendChild(overlayDiv)

          ReactDOM.render(
            <IntlProvider locale={locale} messages={this.messages}>
              <div className="c-stats-map__loading-overlay">
                <Spinner size={50} />
                <div className="c-stats-map__loading-text pt-text-muted">
                  <FormattedMessage id="cases.stats.show.loadingMapData" />
                </div>
              </div>
            </IntlProvider>,
            overlayDiv
          )
        }
      } catch (error) {
        console.error('Error showing loading state for map:', error)
      }
    }

    // Show loading skeleton for summary
    const summaryEl = document.getElementById('stats-summary')
    if (summaryEl) {
      try {
        ReactDOM.render(<StatsSummarySkeleton />, summaryEl)
      } catch (error) {
        console.error('Error rendering loading state for summary:', error)
      }
    }

    // Show skeleton in table area
    const tableEl = document.getElementById('stats-table')
    if (tableEl) {
      try {
        ReactDOM.render(
          <Card style={{ padding: '20px', marginTop: '24px' }}>
            <div
              className="pt-skeleton"
              style={{ height: '20px', width: '200px', marginBottom: '20px' }}
            />
            <div className="pt-skeleton" style={{ height: '300px' }} />
          </Card>,
          tableEl
        )
      } catch (error) {
        console.error('Error rendering loading state for table:', error)
      }
    }
  }

  renderError (error) {
    const errorTitle = 'Unable to Load Stats'
    const errorDescription =
      error.message ||
      'An error occurred while loading the statistics data. Please try again.'

    const errorAction = (
      <button
        className="pt-button pt-intent-primary"
        disabled={this.isFetching}
        onClick={() => this.fetchAndRenderBoth()}
      >
        {this.isFetching ? 'Loading...' : 'Try Again'}
      </button>
    )

    // Show error in map area
    const mapEl = document.getElementById('stats-map')
    if (mapEl) {
      try {
        ReactDOM.render(
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <NonIdealState
              title={errorTitle}
              description={errorDescription}
              visual="error"
              action={errorAction}
            />
          </div>,
          mapEl
        )
      } catch (error) {
        console.error('Error rendering error state for map:', error)
      }
    }

    // Clear table area
    const tableEl = document.getElementById('stats-table')
    if (tableEl) {
      try {
        ReactDOM.render(<div />, tableEl)
      } catch (error) {
        console.error('Error clearing table:', error)
      }
    }
  }

  fetchData () {
    const params = new URLSearchParams()
    const from = this.fromTarget && this.fromTarget.value
    const to = this.toTarget && this.toTarget.value
    if (from) params.set('from', from)
    if (to) params.set('to', to)

    const url = this.dataUrl + '.json?' + params.toString()
    return fetch(url, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    }).then(async r => {
      if (r.ok) return r.json()
      const text = await r.text()
      throw new Error('HTTP ' + r.status + ': ' + text)
    })
  }

  renderResults (payload) {
    // Extract data with proper defaults and validation
    const countries = Array.isArray(payload?.countries) ? payload.countries : []
    const summary =
      payload?.summary && typeof payload.summary === 'object'
        ? payload.summary
        : {}

    try {
      // Handle error responses
      if (!payload || payload.error) {
        this.renderError(new Error(payload?.error || 'Invalid response'))
        return
      }

      // Safety check: limit data size to prevent freezing
      if (countries.length > 1000) {
        this.renderError(
          new Error(
            'Too much data received (' +
              countries.length +
              ' countries). Please choose a smaller date range.'
          )
        )
        return
      }

      // Update the data - the components will handle updates via props
      this.currentData = { countries, summary }

      // Render the components
      this.renderComponents()
    } catch (error) {
      console.error('Error in renderResults setup:', error)
      this.renderError(error)
    } finally {
      this.isFetching = false
    }
  }

  renderComponents () {
    const { countries, summary } = this.currentData || {
      countries: [],
      summary: {},
    }

    // Render summary stats
    const summaryEl = document.getElementById('stats-summary')
    if (summaryEl) {
      try {
        ReactDOM.render(
          <IntlProvider locale={locale} messages={this.messages}>
            <StatsSummary summary={summary} hasData={countries.length > 0} />
          </IntlProvider>,
          summaryEl
        )
      } catch (error) {
        console.error('Error rendering summary:', error)
      }
    }

    // Render the map - keep it mounted and just update props
    const mapEl = document.getElementById('stats-map')
    if (mapEl) {
      try {
        if (countries.length === 0) {
          // Show empty state overlay
          const existingOverlay = mapEl.querySelector('.empty-overlay')
          if (!existingOverlay) {
            const overlayDiv = document.createElement('div')
            overlayDiv.className = 'empty-overlay c-stats-map__loading-overlay'
            mapEl.style.position = 'relative'
            mapEl.appendChild(overlayDiv)

            ReactDOM.render(
              React.createElement(NonIdealState, {
                title: 'No Data Available',
                description:
                  'No visitor data found for the selected date range.',
                visual: 'geosearch',
              }),
              overlayDiv
            )
          }
        } else {
          // Remove empty state overlay
          const emptyOverlay = mapEl.querySelector('.empty-overlay')
          if (emptyOverlay) {
            ReactDOM.unmountComponentAtNode(emptyOverlay)
            emptyOverlay.remove()
          }

          // Remove loading overlay
          const loadingOverlay = mapEl.querySelector('.loading-overlay')
          if (loadingOverlay) {
            ReactDOM.unmountComponentAtNode(loadingOverlay)
            loadingOverlay.remove()
          }

          // Keep map mounted - just update props (React will handle efficient updates)
          // Don't unmount the map component - this is the key fix for the performance bug
          ReactDOM.render(
            <IntlProvider locale={locale} messages={this.messages}>
              {React.createElement(StatsMap, {
                countries,
                minVisits: summary.min_visits || 0,
                maxVisits: summary.max_visits || 0,
              })}
            </IntlProvider>,
            mapEl
          )
        }
      } catch (error) {
        console.error('Error rendering map:', error)
      }
    }

    // Render the table
    const tableEl = document.getElementById('stats-table')
    if (tableEl) {
      try {
        if (countries.length === 0) {
          ReactDOM.render(React.createElement('div'), tableEl)
        } else {
          const caseSlug = this.dataUrl.split('/')[2] // Extract case slug from URL
          ReactDOM.render(
            <IntlProvider locale={locale} messages={this.messages}>
              {React.createElement(StatsTable, {
                data: countries,
                caseSlug,
                onRowClick: country => this.handleCountrySelect(country),
              })}
            </IntlProvider>,
            tableEl
          )
        }
      } catch (error) {
        console.error('Error rendering table:', error)
        ReactDOM.render(React.createElement('div'), tableEl)
      }
    }
  }

  /**
   * Handle country selection from the table
   * Could be extended to zoom the map or filter data
   */
  handleCountrySelect (country) {
    // Reserved for future functionality
  }

  disconnect () {
    this.isConnected = false
    // Clean up event listener
    if (this.rangeChangedHandler) {
      document.removeEventListener(
        'stats-range-changed',
        this.rangeChangedHandler
      )
      this.rangeChangedHandler = null
    }
    // Reset flags to prevent issues if the controller is reconnected
    this.isInitializing = false
    this.isFetching = false
    this.lastRangeChange = 0
  }
}
