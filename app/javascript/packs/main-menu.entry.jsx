/**
 * 
 */

import React from 'react'
import { createRoot } from 'react-dom/client'

import { addLocaleData, IntlProvider } from 'react-intl'

import MainMenu from 'shared/MainMenu'

import loadMessages from '../../../config/locales'

const { locale } = (window.i18n)

Promise.all([
  import(`react-intl/locale-data/${locale.substring(0, 2)}`),
  loadMessages(locale),
]).then(([localeData, messages]) => {
  addLocaleData(localeData.default)
  createRoot(document.getElementById('main-menu-app')).render(
    <IntlProvider locale={locale} messages={messages}>
      <MainMenu />
    </IntlProvider>
  )
})
