import React from 'react'
import { createRoot } from 'react-dom/client'
import { IntlProvider } from 'react-intl'

import MainMenu from 'shared/MainMenu'

export async function mount ({ locale, loadMessages }) {
  const container = document.getElementById('main-menu-app')
  if (container == null) return

  const messages = await loadMessages(locale)

  createRoot(container).render(
    <IntlProvider locale={locale} messages={messages}>
      <MainMenu />
    </IntlProvider>
  )
}
