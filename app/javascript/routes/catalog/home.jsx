import React from 'react'
import { createRoot } from 'react-dom/client'
import { IntlProvider } from 'react-intl'
import { ThemeProvider } from 'styled-components'

import { theme } from 'utility/styledComponents'
import ErrorBoundary from 'utility/ErrorBoundary'
import Catalog from 'catalog'

export async function mount ({ locale, loadMessages }) {
  const container = document.getElementById('catalog-app')
  if (container == null) return

  const messages = await loadMessages(locale)

  createRoot(container).render(
    <ErrorBoundary>
      <IntlProvider locale={locale} messages={messages}>
        <ThemeProvider theme={theme}>
          <Catalog />
        </ThemeProvider>
      </IntlProvider>
    </ErrorBoundary>
  )
}
