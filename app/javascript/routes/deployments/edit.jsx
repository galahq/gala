import React from 'react'
import { createRoot } from 'react-dom/client'
import { IntlProvider } from 'react-intl'
import { ThemeProvider } from 'styled-components'

import { theme } from 'utility/styledComponents'
import Deployment from 'deployment'

function parseJsonAttribute (element, attributeName, fallback = {}) {
  const value = element.getAttribute(attributeName)
  if (!value) return fallback

  return JSON.parse(value)
}

export async function mount ({ locale, loadMessages }) {
  const container = document.getElementById('deployment-app')
  if (container == null) return

  const messages = await loadMessages(locale)

  createRoot(container).render(
    <IntlProvider locale={locale} messages={messages}>
      <ThemeProvider theme={theme}>
        <Deployment {...parseJsonAttribute(container, 'data-params')} />
      </ThemeProvider>
    </IntlProvider>
  )
}
