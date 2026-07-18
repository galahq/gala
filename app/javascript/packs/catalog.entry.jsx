/**
 *
 */

import React from 'react'
import { createRoot } from 'react-dom/client'

import { IntlProvider } from 'react-intl'

import { ThemeProvider } from 'styled-components'
import { theme } from 'utility/styledComponents'

import ErrorBoundary from 'utility/ErrorBoundary'
import Catalog from 'catalog'

import loadMessages from '../../../config/locales'

const { locale } = (window.i18n)

loadMessages(locale).then((messages) => {
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
