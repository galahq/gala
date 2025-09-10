/**
 * @noflow
 */

import { Controller } from 'stimulus'
import React from 'react'
import ReactDOM from 'react-dom'
import { NonIdealState } from '@blueprintjs/core'
import StatsDateRangePicker from '../stats/StatsDateRangePicker'
import StatsResultsTable from '../stats/StatsResultsTable'

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

      const yesterday = new Date(
        end.getFullYear(),
        end.getMonth(),
        end.getDate() - 1
      )
      const shortcuts = [
        { label: 'All time', dateRange: [minDate, end] },
        { label: 'Today', dateRange: [end, end] },
        { label: 'Yesterday', dateRange: [yesterday, yesterday] },
        { label: 'Past week', dateRange: [startFromDays(7), end] },
        { label: 'Past month', dateRange: [startFromDays(30), end] },
        { label: 'Past 3 months', dateRange: [startFromDays(90), end] },
        { label: 'Past 6 months', dateRange: [startFromDays(180), end] },
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

    // Load initial datasets before setting up event listener
    this.fetchAndRenderBoth().then(() => {
      // Only set up the event listener after initial load completes
      this.isInitializing = false
      document.addEventListener('stats-range-changed', this.rangeChangedHandler)
    }).catch((error) => {
      console.error('Initial data load failed:', error)
      this.isInitializing = false
      document.addEventListener('stats-range-changed', this.rangeChangedHandler)
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
    this.renderLoading('by_event')
    this.renderLoading('by_associations')

    try {
      const [events, associations] = await Promise.all([
        this.fetchData('by_event'),
        this.fetchData('by_associations'),
      ])
      this.renderResults({ by_event: events, by_associations: associations })
    } catch (error) {
      this.renderError(error)
    } finally {
      this.isFetching = false
    }
  }

  renderLoading (requestedType) {
    const eventsEl = document.getElementById('stats-events')
    const associationsEl = document.getElementById('stats-associations')

    const Skeleton = ({ lines = 4 }) => (
      <div className="pt-card" style={{ padding: '12px' }}>
        <div
          className="pt-skeleton"
          style={{ height: '16px', width: '40%', marginBottom: '12px' }}
        />
        {[...Array(lines)].map((_, i) => (
          <div
            key={i}
            className="pt-skeleton"
            style={{ height: '12px', marginBottom: '8px' }}
          />
        ))}
      </div>
    )

    if (!requestedType || requestedType === 'by_event') {
      if (eventsEl) ReactDOM.render(<Skeleton lines={8} />, eventsEl)
    }
    if (!requestedType || requestedType === 'by_associations') {
      if (associationsEl) {
        ReactDOM.render(<Skeleton lines={10} />, associationsEl)
      }
    }
  }

  renderError (error) {
    const eventsEl = document.getElementById('stats-events')
    const associationsEl = document.getElementById('stats-associations')

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

    if (eventsEl) {
      ReactDOM.render(
        <NonIdealState
          title={errorTitle}
          description={errorDescription}
          visual="error"
          action={errorAction}
        />,
        eventsEl
      )
    }

    if (associationsEl) {
      ReactDOM.render(
        <NonIdealState
          title={errorTitle}
          description={errorDescription}
          visual="error"
          action={errorAction}
        />,
        associationsEl
      )
    }
  }

  fetchData (requestedType) {
    const params = new URLSearchParams()
    const from = this.fromTarget && this.fromTarget.value
    const to = this.toTarget && this.toTarget.value
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    if (requestedType) params.set('type', requestedType)

    const url = `${this.dataUrl}?${params.toString()}`
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
    // handle both fetch-error (array) and server error (object)
    const serverError = payload && payload.error ? payload : null
    if (serverError) {
      this.renderError(serverError)
      return
    }

    const eventsEl = document.getElementById('stats-events')
    const associationsEl = document.getElementById('stats-associations')

    // debug: surface payload in console to help diagnose rendering issues
    console.debug('case-stats payload', { payload })

    const byEvent = payload.by_event || []
    const byAssoc = payload.by_associations || []

    if (eventsEl) {
      ReactDOM.render(<StatsResultsTable rows={byEvent} />, eventsEl)
    }

    if (associationsEl) {
      const Stat = ({ label, value }) => (
          <div style={{ display: 'flex', gap: '6px' }}>
            <span className="pt-text-muted" style={{ flex: '0 0 auto' }}>
              {label}
            </span>
            <span className="pt-tag pt-minimal" style={{ flex: '0 0 auto' }}>
              {value}
            </span>
          </div>
        )

      const AssociationsGrid = () => (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            {byAssoc.length === 0 ? (
              <div
                className="pt-card pt-elevation-0"
                style={{ padding: '12px' }}
              >
                <div className="pt-text-muted">No associations found.</div>
              </div>
            ) : (
              byAssoc.map((r, i) => (
                <div key={i} className="pt-card pt-elevation-1">
                  <div className="pt-heading" style={{ marginBottom: '6px' }}>
                    {r.library_name || 'Associations'}
                  </div>
                  <div style={{ display: 'grid', gap: '6px' }}>
                    <Stat label="Deployments" value={r.deployments_count} />
                    <Stat label="Enrollments" value={r.enrollments_count} />
                    <Stat label="Edgenotes" value={r.edgenotes_count} />
                    <Stat label="Cards" value={r.cards_count} />
                    <Stat label="Case elements" value={r.case_elements_count} />
                    <Stat label="Pages" value={r.pages_count} />
                    <Stat label="Podcasts" value={r.podcasts_count} />
                    <Stat
                      label="Wikidata links"
                      value={r.wikidata_links_count}
                    />
                    {r.managers_names ? (
                      <div style={{ display: 'grid', gap: '4px' }}>
                        <span className="pt-text-muted">Manager names</span>
                        <div className="pt-tag pt-minimal">
                          {r.managers_names}
                        </div>
                      </div>
                    ) : null}
                    {r.authors_names ? (
                      <div style={{ display: 'grid', gap: '4px' }}>
                        <span className="pt-text-muted">Author names</span>
                        <div className="pt-tag pt-minimal">
                          {r.authors_names}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        )

      ReactDOM.render(<AssociationsGrid />, associationsEl)
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
