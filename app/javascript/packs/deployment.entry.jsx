/**
 * @noflow
 */

import React from 'react'
import ReactDOM from 'react-dom'
import { addLocaleData, IntlProvider } from 'react-intl'

import Deployment from 'deployment'

import { ThemeProvider } from 'styled-components'
import { theme } from 'utility/styledComponents'

const { locale } = (window.i18n: { locale: string })
import loadMessages from '../../../config/locales' // eslint-disable-line

const container = document.getElementById('deployment-app')

Promise.all([
  import(`react-intl/locale-data/${locale.substring(0, 2)}`),
  loadMessages(locale),
]).then(([localeData, messages]) => {
  addLocaleData(localeData)
  ReactDOM.render(
    <IntlProvider locale={locale} messages={messages}>
      <ThemeProvider theme={theme}>
        <Deployment {...JSON.parse(container.getAttribute('data-params'))} />
      </ThemeProvider>
    </IntlProvider>,
    container
  )
})
