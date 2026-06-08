/**
 * 
 */

import React from 'react'
import { createRoot } from 'react-dom/client'

import { addLocaleData, IntlProvider } from 'react-intl'

import { ThemeProvider } from 'styled-components'
import { theme } from 'utility/styledComponents'

import ErrorBoundary from 'utility/ErrorBoundary'
import Catalog from 'catalog'

import loadMessages from '../../../config/locales'

const { locale } = (window.i18n)

Promise.all([
  import(`react-intl/locale-data/${locale.substring(0, 2)}`),
  loadMessages(locale),
]).then(([localeData, messages]) => {
  addLocaleData(localeData.default)
  createRoot(document.getElementById('catalog-app')).render(
    <ErrorBoundary>
      <IntlProvider locale={locale} messages={messages}>
        <ThemeProvider theme={theme}>
          <Catalog />
        </ThemeProvider>
      </IntlProvider>
    </ErrorBoundary>
  )
})
