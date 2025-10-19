/**
 * @noflow
 */

import { Controller } from 'stimulus'
import React from 'react'
import ReactDOM from 'react-dom'
import { NonIdealState } from '@blueprintjs/core'
import { getAccessibleTextColor } from '../utility/colors'
import StatsDateRangePicker from '../stats/StatsDateRangePicker'
import StatsMapWithLegend from '../stats/StatsMapWithLegend'
import StatsTable from '../stats/StatsTable'

export default class extends Controller {
  static targets = ['from', 'to']

  connect () {
    // Prevent recursive calls during initialization
    this.isInitializing = true
    this.isFetching = false
    const dataUrl = this.element.dataset.url
    this.publishedAt = this.element.dataset.published_at

    this.dataUrl = dataUrl

    // Mount React DateRangePicker once (outside controller element)
    const pickerEl = document.getElementById('stats-range-picker')
    if (pickerEl && !pickerEl.dataset.reactMounted) {
      const minDate = this.publishedAt ? new Date(this.publishedAt) : new Date()
      const maxDate = new Date()

      const today = new Date()
      const end = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      )
      const startFromDays = d =>
        new Date(end.getFullYear(), end.getMonth(), end.getDate() - d + 1)
      const initialRange = [minDate, end]

      const shortcuts = [
        { label: 'All time', dateRange: [minDate, end] },
        { label: 'Past year', dateRange: [startFromDays(365), end] },
        { label: 'Past 2 years', dateRange: [startFromDays(730), end] },
      ]

      // store presets for matching/highlighting later
      this.shortcuts = shortcuts

      ReactDOM.render(
        <StatsDateRangePicker
          minDate={minDate}
          maxDate={maxDate}
          fromInputId="stats-from"
          toInputId="stats-to"
          shortcuts={shortcuts}
          initialRange={initialRange}
        />,
        pickerEl
      )
      pickerEl.dataset.reactMounted = '1'
      // highlight initial active shortcut once the DOM is painted
      setTimeout(() => this.highlightActiveShortcut(), 0)
    }

    // Set up event listener with guard against recursive calls
    this.rangeChangedHandler = () => {
      // Don't respond to events during initialization or while already fetching
      if (this.isInitializing || this.isFetching) return

      this.currentQuery = 'by_event'
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

  apply () {
    // Prevent overlapping requests
    if (this.isFetching) return

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
      const todayStr = `${yyyy}-${mm}-${dd}`
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
    window.history.replaceState({}, '', `${url.pathname}?${params.toString()}`)
    // Update shortcut highlighting to reflect current range
    this.highlightActiveShortcut()
    this.fetchAndRenderBoth()
  }

  isoDate (d) {
    // Normalize to UTC date string to match values written by the picker
    // (StatsDateRangePicker writes hidden inputs via toISOString().slice(0, 10))
    return d ? d.toISOString().slice(0, 10) : ''
  }

  highlightActiveShortcut () {
    try {
      const ul = document.querySelector('.pt-daterangepicker-shortcuts')
      if (!ul) return
      const items = ul.querySelectorAll('li')
      items.forEach(li =>
        li.classList.remove('DayPicker-Day', 'DayPicker-Day--selected')
      )

      const fromVal = this.fromTarget && this.fromTarget.value
      const toVal = this.toTarget && this.toTarget.value
      if (!fromVal || !toVal || !Array.isArray(this.shortcuts)) return

      let matchIdx = -1
      for (let i = 0; i < this.shortcuts.length; i++) {
        const [sf, st] = this.shortcuts[i].dateRange
        if (this.isoDate(sf) === fromVal && this.isoDate(st) === toVal) {
          matchIdx = i
          break
        }
      }
      if (matchIdx >= 0 && items[matchIdx]) {
        items[matchIdx].classList.add(
          'DayPicker-Day',
          'DayPicker-Day--selected'
        )
      }
    } catch (_) {
      // ignore highlighting errors; do not block stats fetch
    }
  }

  async fetchAndRenderBoth () {
    // Prevent overlapping requests
    if (this.isFetching) return

    this.isFetching = true
    this.renderLoading()

    try {
      const data = await this.fetchData()
      this.renderResults(data)
    } catch (error) {
      this.renderError(error)
    } finally {
      this.isFetching = false
    }
  }

  renderLoading () {
    // Show loading skeleton in map area
    const mapEl = document.getElementById('stats-map')
    if (mapEl) {
      ReactDOM.render(
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f9fafb',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div className="pt-spinner pt-large">
              <div className="pt-spinner-svg-container">
                <svg viewBox="0 0 100 100">
                  <path
                    className="pt-spinner-track"
                    d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90"
                  ></path>
                  <path
                    className="pt-spinner-head"
                    d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90"
                  ></path>
                </svg>
              </div>
            </div>
            <p style={{ marginTop: '20px', color: '#6b7280' }}>
              Loading statistics...
            </p>
          </div>
        </div>,
        mapEl
      )
    }

    // Show skeleton in table area
    const tableEl = document.getElementById('stats-table')
    if (tableEl) {
      ReactDOM.render(
        <div className="pt-card" style={{ padding: '20px', marginTop: '24px' }}>
          <div
            className="pt-skeleton"
            style={{ height: '20px', width: '200px', marginBottom: '20px' }}
          />
          <div className="pt-skeleton" style={{ height: '300px' }} />
        </div>,
        tableEl
      )
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
    }

    // Clear table area
    const tableEl = document.getElementById('stats-table')
    if (tableEl) {
      ReactDOM.render(<div />, tableEl)
    }
  }

  fetchData () {
    const params = new URLSearchParams()
    const from = this.fromTarget && this.fromTarget.value
    const to = this.toTarget && this.toTarget.value
    if (from) params.set('from', from)
    if (to) params.set('to', to)

    const url = `${this.dataUrl}.json?${params.toString()}`
    return fetch(url, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    }).then(async r => {
      if (r.ok) return r.json()
      const text = await r.text()
      throw new Error(`HTTP ${r.status}: ${text}`)
    })
  }

  renderResults (payload) {
    // Handle error responses
    if (!payload || payload.error) {
      this.renderError(new Error(payload?.error || 'Invalid response'))
      return
    }

    // Debug logging
    console.debug('case-stats payload', { payload })

    // Extract data with proper defaults
    const formatted = payload.formatted || []
    const summary = payload.summary || {}

    // Render summary stats
    const summaryEl = document.getElementById('stats-summary')
    if (summaryEl) {
      if (formatted.length === 0) {
        ReactDOM.render(
          <div style={{ color: '#9ca3af' }}>
            <div>No data available for selected period</div>
          </div>,
          summaryEl
        )
      } else {
        ReactDOM.render(
          <div>
            <div>
              Total Unique Visitors:{' '}
              <strong>{(summary.total_visits || 0).toLocaleString()}</strong>
            </div>
            <div>
              Countries: <strong>{summary.country_count || 0}</strong>
            </div>
            <div>
              Total Deployments:{' '}
              <strong>
                {(summary.total_deployments || 0).toLocaleString()}
              </strong>
            </div>
            <div>
              Podcast Listens:{' '}
              <strong>
                {(summary.total_podcast_listens || 0).toLocaleString()}
              </strong>
            </div>
            {summary.case_published_at && (
              <div>
                Published: <strong>{summary.case_published_at}</strong>
              </div>
            )}

            {/* Visitor Distribution */}
            {summary.percentiles && summary.percentiles.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                  Visitor Distribution
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    flexWrap: 'wrap',
                  }}
                >
                  {summary.percentiles.map((p, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '24px',
                          background: p.color,
                          border: '1px solid #e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title={`${p.percentile}th percentile: ${p.value} visitors`}
                      >
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: getAccessibleTextColor(p.color),
                            lineHeight: '1',
                          }}
                        >
                          {p.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    marginTop: '4px',
                    color: '#6b7280',
                  }}
                >
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            )}
          </div>,
          summaryEl
        )
      }
    }

    // Render the map
    const mapEl = document.getElementById('stats-map')
    if (mapEl) {
      if (formatted.length === 0) {
        ReactDOM.render(
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f9fafb',
            }}
          >
            <NonIdealState
              title="No Data Available"
              description="No visitor data found for the selected date range."
              visual="geosearch"
            />
          </div>,
          mapEl
        )
      } else {
        ReactDOM.render(
          <StatsMapWithLegend
            countries={formatted}
            percentiles={summary.percentiles || []}
          />,
          mapEl
        )
      }
    }

    // Render the table
    const tableEl = document.getElementById('stats-table')
    if (tableEl) {
      if (formatted.length === 0) {
        ReactDOM.render(<div />, tableEl)
      } else {
        const caseSlug = this.dataUrl.split('/')[2] // Extract case slug from URL
        ReactDOM.render(
          <StatsTable
            data={formatted}
            caseSlug={caseSlug}
            onRowClick={country => this.handleCountrySelect(country)}
          />,
          tableEl
        )
      }
    }
  }

  handleCountrySelect (country) {
    // Trigger map to fly to the selected country
    if (window.mapFlyToCountry) {
      window.mapFlyToCountry(country.name)
    }
  }

  disconnect () {
    // Clean up event listener
    if (this.rangeChangedHandler) {
      document.removeEventListener(
        'stats-range-changed',
        this.rangeChangedHandler
      )
    }

    // Reset flags to prevent issues if the controller is reconnected
    this.isInitializing = false
    this.isFetching = false
  }
}
