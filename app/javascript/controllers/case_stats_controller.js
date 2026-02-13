/** @jsx React.createElement */
/* @flow */

import { Controller } from 'stimulus'
import React from 'react'
import ReactDOM from 'react-dom'
import { IntlProvider, addLocaleData } from 'react-intl'

import loadMessages from '../../../config/locales'
import ErrorBoundary from '../utility/ErrorBoundary'

import StatsPage from '../stats/StatsPage'

/**
 * Thin wrapper that mounts the StatsPage React component
 */
export default class extends Controller {
  connect () {
    if (this.isConnected) {
      return
    }
    this.isConnected = true

    const locale = (window.i18n && window.i18n.locale) || 'en'
    const dataUrl = this.element.dataset.url
    const minDate = this.element.dataset.minDate

    Promise.all([
      import(`react-intl/locale-data/${locale.substring(0, 2)}`),
      loadMessages(locale),
    ]).then(([localeData, messages]) => {
      addLocaleData(localeData.default)
      ReactDOM.render(
        <ErrorBoundary>
          <IntlProvider locale={locale} messages={messages}>
            <StatsPage
              dataUrl={dataUrl}
              minDate={minDate}
              messages={messages}
            />
          </IntlProvider>
        </ErrorBoundary>,
        this.element
      )
    }).catch((e) => {
      console.error(e)
      ReactDOM.unmountComponentAtNode(this.element)
      this.isConnected = false
    })
  }

  disconnect () {
    ReactDOM.unmountComponentAtNode(this.element)
    this.isConnected = false
  }
}
