/** @jsx React.createElement */
/* @flow */

import { Controller } from 'stimulus'
import React from 'react'
import ReactDOM from 'react-dom'
import { NonIdealState, Spinner, Card } from '@blueprintjs/core'
import { IntlProvider } from 'react-intl'
import StatsDateRangePicker from '../stats/StatsDateRangePicker'
import StatsMap from '../stats/StatsMap'
import StatsTable from '../stats/StatsTable'
import loadMessages from '../../../config/locales'

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
    this.currentRequestId = 0
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
        const minDate = this.publishedAt
          ? new Date(this.publishedAt)
          : new Date()
        const maxDate = new Date()

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
            React.createElement(
              'div',
              {
                style: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  zIndex: 1000,
                },
              },
              React.createElement(Spinner, { size: 50 }),
              React.createElement(
                'div',
                {
                  style: {
                    marginTop: '12px',
                    color: '#6b7280',
                    fontSize: '14px',
                  },
                },
                'Loading map data...'
              )
            ),
            overlayDiv
          )
        }
      } catch (error) {
        console.error('Error showing loading state for map:', error)
      }
    }

    // Show detailed skeleton in summary area
    const summaryEl = document.getElementById('stats-summary')
    if (summaryEl) {
      try {
        ReactDOM.render(
          <div
            style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#000000',
              height: '200px',
            }}
          >
            {/* Summary header with published date */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '1px solid #e5e7eb',
                fontSize: '17px',
              }}
            >
              <div
                className="pt-skeleton"
                style={{ height: '20px', width: '80px' }}
              />
              <div
                className="pt-skeleton"
                style={{ height: '20px', width: '120px' }}
              />
            </div>

            {/* Statistics */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '140px' }}
              />
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '60px' }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '70px' }}
              />
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '30px' }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '120px' }}
              />
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '50px' }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '120px' }}
              />
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '40px' }}
              />
            </div>

            {/* Translations (optional) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '90px' }}
              />
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '80px' }}
              />
            </div>
          </div>,
          summaryEl
        )
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

    // bin_count is now hard-coded to 5 in the backend

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
    const formatted = Array.isArray(payload?.formatted) ? payload.formatted : []
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

      // Debug logging
      console.debug('case-stats payload', { payload })

      // Safety check: limit data size to prevent freezing
      if (formatted.length > 1000) {
        this.renderError(
          new Error(
            'Too much data received (' +
              formatted.length +
              ' countries). Please choose a smaller date range.'
          )
        )
        return
      }

      // Update the data - the components will handle updates via props
      this.currentData = { formatted, summary }

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
    const { formatted, summary } = this.currentData || {
      formatted: [],
      summary: {},
    }

    // Render summary stats
    const summaryEl = document.getElementById('stats-summary')
    if (summaryEl) {
      try {
        if (formatted.length === 0) {
          ReactDOM.render(
            React.createElement(
              'div',
              { style: { color: '#9ca3af' }},
              React.createElement(
                'div',
                null,
                'No data available for selected period'
              )
            ),
            summaryEl
          )
        } else {
          ReactDOM.render(
            React.createElement(
              'div',
              {
                style: {
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#000000',
                },
              },
              // Summary header
              React.createElement(
                'div',
                {
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '17px',
                  },
                },
                React.createElement(
                  'span',
                  { style: { fontWeight: 'bold' }},
                  'Summary'
                ),
                summary.case_published_at &&
                  React.createElement(
                    'strong',
                    null,
                    'pub: ' +
                      new Date(summary.case_published_at).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }
                      )
                  )
              ),
              // Statistics
              React.createElement(
                'div',
                {
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  },
                },
                React.createElement('span', null, 'Total Unique Visitors'),
                React.createElement(
                  'strong',
                  null,
                  (summary.total_visits || 0).toLocaleString()
                )
              ),
              React.createElement(
                'div',
                {
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  },
                },
                React.createElement('span', null, 'Countries'),
                React.createElement('strong', null, summary.country_count || 0)
              ),
              React.createElement(
                'div',
                {
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  },
                },
                React.createElement('span', null, 'Total Deployments'),
                React.createElement(
                  'strong',
                  null,
                  (summary.total_deployments || 0).toLocaleString()
                )
              ),
              React.createElement(
                'div',
                {
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  },
                },
                React.createElement('span', null, 'Podcast Listens'),
                React.createElement(
                  'strong',
                  null,
                  (summary.total_podcast_listens || 0).toLocaleString()
                )
              ),
              // Translations
              summary.case_locales &&
                React.createElement(
                  'div',
                  {
                    style: {
                      display: 'flex',
                      justifyContent: 'space-between',
                    },
                  },
                  React.createElement('span', null, 'Translations'),
                  React.createElement('strong', null, summary.case_locales)
                )
            ),
            summaryEl
          )
        }
      } catch (error) {
        console.error('Error rendering summary:', error)
      }
    }

    // Render the map - keep it mounted and just update props
    const mapEl = document.getElementById('stats-map')
    if (mapEl) {
      try {
        if (formatted.length === 0) {
          // Show empty state overlay
          const existingOverlay = mapEl.querySelector('.empty-overlay')
          if (!existingOverlay) {
            const overlayDiv = document.createElement('div')
            overlayDiv.className = 'empty-overlay'
            overlayDiv.style.cssText =
              'position: absolute; top: 0; left: 0; right: 0; bottom: 0; ' +
              'background: rgba(249, 250, 251, 0.9); display: flex; ' +
              'align-items: center; justify-content: center; z-index: 1000;'
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
                countries: formatted,
                bins: summary.bins || [],
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
        if (formatted.length === 0) {
          ReactDOM.render(React.createElement('div'), tableEl)
        } else {
          const caseSlug = this.dataUrl.split('/')[2] // Extract case slug from URL
          ReactDOM.render(
            <IntlProvider locale={locale} messages={this.messages}>
              {React.createElement(StatsTable, {
                data: formatted,
                caseSlug,
                bins: summary.bins || [],
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

  /**
   * Clean up when controller is disconnected
   */
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
    this.currentRequestId = 0
  }
}
