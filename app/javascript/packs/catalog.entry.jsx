/**
 * @noflow
 */

import React from 'react'
import ReactDOM from 'react-dom'

import { addLocaleData, IntlProvider } from 'react-intl'

import { ThemeProvider } from 'styled-components'
import { theme } from 'utility/styledComponents'

import ErrorBoundary from 'utility/ErrorBoundary'
import Catalog from 'catalog'

import loadMessages from '../../../config/locales'

const { locale } = (window.i18n: { locale: string })

Promise.all([
  import(`react-intl/locale-data/${locale.substring(0, 2)}`),
  loadMessages(locale),
]).then(([localeData, messages]) => {
  addLocaleData(localeData.default)
  ReactDOM.render(
    <ErrorBoundary>
      <IntlProvider locale={locale} messages={messages}>
        <ThemeProvider theme={theme}>
          <Catalog />
        </ThemeProvider>
      </IntlProvider>
    </ErrorBoundary>,
    document.getElementById('catalog-app')
  )
})
