/** @jsx React.createElement */
/* @flow */

import { Controller } from 'stimulus'
import React from 'react'
import ReactDOM from 'react-dom'
import StatsPage from '../stats/StatsPage'
import loadMessages from '../../../config/locales'

const locale = (window.i18n && window.i18n.locale) || 'en'

/**
 * Thin wrapper that mounts the StatsPage React component
 */
export default class extends Controller {
  connect () {
    if (this.isConnected) {
      return
    }
    this.isConnected = true

    const dataUrl = this.element.dataset.url
    const publishedAt = this.element.dataset.published_at

    loadMessages(locale)
      .then(messages => {
        this.mountStatsPage(dataUrl, publishedAt, messages)
      })
      .catch(() => {
        this.mountStatsPage(dataUrl, publishedAt, {})
      })
  }

  mountStatsPage (dataUrl: string, publishedAt: ?string, messages: { [string]: string }) {
    ReactDOM.render(
      <StatsPage
        dataUrl={dataUrl}
        publishedAt={publishedAt}
        messages={messages}
        locale={locale}
      />,
      this.element
    )
  }

  disconnect () {
    ReactDOM.unmountComponentAtNode(this.element)
    this.isConnected = false
  }
}
