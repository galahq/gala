/** @jsx React.createElement */
/* @flow */

import { Controller } from 'stimulus'
import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'

import StatsRoot from '../stats'

function parseCount (value: ?string): number {
  if (!value) return 0
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : 0
}

function parseLocales (value: ?string): string[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      return parsed
        .map(locale => (typeof locale === 'string' ? locale.trim() : ''))
        .filter(Boolean)
    }
  } catch (_error) {
    // Ignore parse errors and fall back to comma-delimited parsing.
  }

  return value
    .split(',')
    .map(locale => locale.trim())
    .filter(Boolean)
}

export default class extends Controller {
  connect () {
    if (this.hasMounted) return
    this.hasMounted = true

    const endpoint =
      this.element.dataset.endpoint ||
      window.location.pathname.replace(/\/$/, '')
    const locale = this.element.dataset.locale || 'en'
    const initialCase = {
      link: this.element.dataset.link || '',
      published_at: this.element.dataset.publishedAt || null,
      min_date: this.element.dataset.minDate || null,
      max_date: this.element.dataset.maxDate || null,
      deployments_count: parseCount(this.element.dataset.deploymentsCount),
      locales: parseLocales(this.element.dataset.locales),
    }
    this.renderStats({
      endpoint,
      initialCase,
      locale,
    })
  }

  disconnect () {
    unmountComponentAtNode(this.element)
    this.hasMounted = false
  }

  renderStats ({
    endpoint,
    initialCase,
    locale,
  }: {
    endpoint: string,
    initialCase: {
      link: string,
      published_at: ?string,
      min_date: ?string,
      max_date: ?string,
      deployments_count: number,
      locales: string[],
    },
    locale: string,
  }) {
    render(
      <StatsRoot
        endpoint={endpoint}
        initialCase={initialCase}
        locale={locale}
      />,
      this.element
    )
  }
}
