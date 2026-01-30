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

// Convert snake_case to camelCase for locale key lookup (matches config/locales flattenObj)
function toCamel (str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

export default class extends Controller {
  static targets = ['from', 'to']

  // Look up case stats show message; key is snake_case suffix (e.g. 'filtered_stats')
  msg (key) {
    if (!this.messages) return key
    const fullKey = `cases.stats.show.${toCamel(key)}`
    return this.messages[fullKey] != null ? this.messages[fullKey] : key
  }

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
    this.allTimeStats = null

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

    // Show loading state immediately before initial data fetch
    this.renderLoading()

    // Fetch all-time stats first (no date parameters)
    this.fetchAllTimeStats()
      .then(() => {
        // Then load initial dataset with date range
        return this.fetchAndRenderBoth()
      })
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
              { className: 'c-stats-map__loading-overlay' },
              React.createElement(Spinner, { size: 50 }),
              React.createElement(
                'div',
                { className: 'c-stats-map__loading-text pt-text-muted' },
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

    // Summary skeleton is handled by the view template - no need to re-render it
    const summaryEl = document.getElementById('stats-summary')
    if (summaryEl) {
      try {
        ReactDOM.render(
          <div className="c-stats-summary__content">
            {/* Statistics */}
            <div className="c-stats-summary__row">
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '140px' }}
              />
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '60px' }}
              />
            </div>
            <div className="c-stats-summary__row">
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '70px' }}
              />
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '30px' }}
              />
            </div>
            <div className="c-stats-summary__row">
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '120px' }}
              />
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '50px' }}
              />
            </div>
            <div className="c-stats-summary__row">
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '120px' }}
              />
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '40px' }}
              />
            </div>

          </div>,
          summaryEl
        )
      } catch (error) {
        console.error('Error rendering loading state for summary:', error)
      }
    }

    // Information skeleton
    const informationEl = document.getElementById('stats-information')
    if (informationEl) {
      try {
        ReactDOM.render(
          <div className="c-stats-information__content">
            {/* Information rows */}
            <div className="c-stats-information__row">
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '180px' }}
              />
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '60px' }}
              />
            </div>
            <div className="c-stats-information__row">
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '150px' }}
              />
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '30px' }}
              />
            </div>
            <div className="c-stats-information__row">
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '150px' }}
              />
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '80px' }}
              />
            </div>
            <div className="c-stats-information__row">
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '70px' }}
              />
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '100px' }}
              />
            </div>
            <div className="c-stats-information__row">
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '130px' }}
              />
              <div
                className="pt-skeleton"
                style={{ height: '16px', width: '40px' }}
              />
            </div>
          </div>,
          informationEl
        )
      } catch (error) {
        console.error('Error rendering loading state for information:', error)
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

  fetchAllTimeStats () {
    // Fetch stats without date parameters to get all-time totals
    const url = this.dataUrl + '.json'
    return fetch(url, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
      .then(async r => {
        if (r.ok) return r.json()
        const text = await r.text()
        throw new Error('HTTP ' + r.status + ': ' + text)
      })
      .then(payload => {
        const formatted = Array.isArray(payload?.formatted) ? payload.formatted : []
        const summary =
          payload?.summary && typeof payload.summary === 'object'
            ? payload.summary
            : {}
        this.allTimeStats = {
          total_visits: summary.total_visits || 0,
          country_count: summary.country_count || 0,
        }
        // Store summary data for information section (case-level info that doesn't change)
        if (!this.caseSummary) {
          this.caseSummary = {
            case_locales: summary.case_locales,
            case_published_at: summary.case_published_at,
            total_deployments: summary.total_deployments,
          }
        }
        // Re-render information section with all-time stats
        this.renderInformationSection()
      })
      .catch(error => {
        console.error('Error fetching all-time stats:', error)
        // Set defaults on error
        this.allTimeStats = { total_visits: 0, country_count: 0 }
        this.renderInformationSection()
      })
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

      // Store case-level summary data (doesn't change with date range)
      if (!this.caseSummary || summary.case_locales) {
        this.caseSummary = {
          case_locales: summary.case_locales,
          case_published_at: summary.case_published_at,
          total_deployments: summary.total_deployments,
        }
      }

      // Render the components
      this.renderComponents()
    } catch (error) {
      console.error('Error in renderResults setup:', error)
      this.renderError(error)
    } finally {
      this.isFetching = false
    }
  }

  renderInformationSection () {
    // Use currentData summary if available, otherwise use stored caseSummary
    const { summary } = this.currentData || { summary: {} }
    const caseInfo = summary.case_locales
      ? summary
      : this.caseSummary || {}
    const allTimeStats = this.allTimeStats || { total_visits: 0, country_count: 0 }

    const informationEl = document.getElementById('stats-information')
    if (informationEl) {
      try {
        ReactDOM.render(
          React.createElement(
            'div',
            { className: 'c-stats-information__content' },
            // Publication date
            caseInfo.case_published_at &&
              React.createElement(
                'div',
                { className: 'c-stats-information__row' },
                React.createElement('span', { className: 'c-stats-information__label' }, this.msg('date_published')),
                React.createElement(
                  'span',
                  { className: 'c-stats-information__value' },
                  new Date(caseInfo.case_published_at).toLocaleDateString(
                    'en-US',
                    {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }
                  )
                )
              ),
              // Translations
            caseInfo.case_locales &&
            React.createElement(
              'div',
              { className: 'c-stats-information__row' },
              React.createElement('span', { className: 'c-stats-information__label' }, this.msg('available_translations')),
              React.createElement('span', { className: 'c-stats-information__value' }, caseInfo.case_locales)
            ),
            // Total Deployments
            React.createElement(
              'div',
              { className: 'c-stats-information__row' },
              React.createElement('span', { className: 'c-stats-information__label' }, this.msg('total_deployments')),
              React.createElement(
                'span',
                { className: 'c-stats-information__value' },
                (caseInfo.total_deployments || 0).toLocaleString()
              )
            ),
            // All-time Unique Visitors
            React.createElement(
              'div',
              { className: 'c-stats-information__row' },
React.createElement('span', { className: 'c-stats-information__label' }, this.msg('table_unique_visitors')),
                React.createElement(
                  'span',
                  { className: 'c-stats-information__value' },
                  (allTimeStats.total_visits || 0).toLocaleString()
                )
              ),
            // All-time Countries
            React.createElement(
              'div',
              { className: 'c-stats-information__row' },
              React.createElement('span', { className: 'c-stats-information__label' }, this.msg('countries')),
              React.createElement(
                'span',
                { className: 'c-stats-information__value' },
                allTimeStats.country_count || 0
              )
            ),
          ),
          informationEl
        )
      } catch (error) {
        console.error('Error rendering information:', error)
      }
    }
  }

  renderComponents () {
    const { formatted, summary } = this.currentData || {
      formatted: [],
      summary: {},
    }

    // Get date range from picker
    const from = this.fromTarget && this.fromTarget.value
    const to = this.toTarget && this.toTarget.value

    const formatDateRange = () => {
      if (!from && !to) return ''
      const formatDate = (dateStr) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      }
      const fromFormatted = formatDate(from)
      const toFormatted = formatDate(to)
      if (fromFormatted && toFormatted) {
        return `${fromFormatted} - ${toFormatted}`
      }
      return fromFormatted || toFormatted || ''
    }

    const dateRangeText = formatDateRange()

    // Render summary stats
    const summaryEl = document.getElementById('stats-summary')
    if (summaryEl) {
      try {
        if (formatted.length === 0) {
          ReactDOM.render(
            React.createElement(
              'div',
              { className: 'c-stats-summary__no-data' },
              this.msg('no_data')
            ),
            summaryEl
          )
        } else {
          ReactDOM.render(
            React.createElement(
              'div',
              { className: 'c-stats-summary__content' },
              // Summary header with date range
              dateRangeText &&
                React.createElement(
                  'div',
                  { className: 'c-stats-summary__header' },
                  React.createElement('h3', null, this.msg('filtered_stats')),
                  React.createElement(
                    'span',
                    { className: 'c-stats-summary__date-range' },
                    dateRangeText
                  )
                ),
              // Statistics
              React.createElement(
                'div',
                { className: 'c-stats-summary__row' },
                React.createElement('span', { className: 'c-stats-summary__label' }, this.msg('table_unique_visitors')),
                React.createElement(
                  'span',
                  { className: 'c-stats-summary__value' },
                  (summary.total_visits || 0).toLocaleString()
                )
              ),
              
              React.createElement(
                'div',
                { className: 'c-stats-summary__row' },
                React.createElement('span', { className: 'c-stats-summary__label' }, this.msg('countries')),
                React.createElement('span', { className: 'c-stats-summary__value' }, summary.country_count || 0)
              ),
              React.createElement(
                'div',
                { className: 'c-stats-summary__row' },
                React.createElement('span', { className: 'c-stats-summary__label' }, this.msg('podcast_listens_short')),
                React.createElement(
                  'span',
                  { className: 'c-stats-summary__value' },
                  (summary.total_podcast_listens || 0).toLocaleString()
                )
              )
            ),
            summaryEl
          )
        }
      } catch (error) {
        console.error('Error rendering summary:', error)
      }
    }

    // Update date range in map/table section to match Filtered Stats
    const mapTableDateRangeEl = document.getElementById('stats-map-table-date-range')
    if (mapTableDateRangeEl) {
      mapTableDateRangeEl.textContent = dateRangeText ? ` ${dateRangeText}` : ''
    }

    // Render information section
    this.renderInformationSection()

    // Render the map - keep it mounted and just update props
    const mapEl = document.getElementById('stats-map')
    if (mapEl) {
      try {
        if (formatted.length === 0) {
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
  }
}
