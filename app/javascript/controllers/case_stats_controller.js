/** @jsx React.createElement */
/* @flow */

import { Controller } from 'stimulus'
import React from 'react'
import ReactDOM from 'react-dom'
import StatsPage from '../stats/StatsPage'
import loadMessages from '../../../config/locales'

const locale = (window.i18n && window.i18n.locale) || 'en'
const messagesCache: Map<string, Promise<{ [string]: string }>> = new Map()

function loadMessagesForLocale (targetLocale: string): Promise<{ [string]: string }> {
  if (messagesCache.has(targetLocale)) {
    // $FlowFixMe Map#get is safe after has check
    return messagesCache.get(targetLocale)
  }
  const promise = loadMessages(targetLocale).catch(error => {
    console.warn('Failed to load locale messages:', error)
    return {}
  })
  messagesCache.set(targetLocale, promise)
  return promise
}

/**
 * Thin wrapper that mounts the StatsPage React component
 */
export default class extends Controller {
  connect () {
    if (this.hasMounted) {
      return
    }
    this.hasMounted = true

    const dataUrl = this.element.dataset.url
    if (!dataUrl) {
      console.error('Stats controller missing data-url attribute')
      return
    }

    const minDate = this.element.dataset.minDate || null
    loadMessagesForLocale(locale).then(messages => {
      this.mountStatsPage(dataUrl, minDate, messages)
    })
  }

  mountStatsPage (
    dataUrl: string,
    minDate: ?string,
    messages: { [string]: string }
  ) {
    const node = this.element
    const element = (
      <StatsPage
        dataUrl={dataUrl}
        minDate={minDate}
        messages={messages}
        locale={locale}
      />
    )

    if (ReactDOM.createRoot) {
      if (!this.root) {
        this.root = ReactDOM.createRoot(node)
      }
      this.root.render(element)
    } else {
      ReactDOM.render(element, node)
    }
  }

  disconnect () {
    if (this.root) {
      this.root.unmount()
      this.root = null
    } else {
      ReactDOM.unmountComponentAtNode(this.element)
    }
    this.hasMounted = false
  }
}
