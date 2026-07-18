/**
 *
 */

import React from 'react'
import { createRoot } from 'react-dom/client'

import { IntlProvider } from 'react-intl'

import MainMenu from 'shared/MainMenu'

import loadMessages from '../../../config/locales'

const { locale } = (window.i18n)

loadMessages(locale).then((messages) => {
  createRoot(document.getElementById('main-menu-app')).render(
    <IntlProvider locale={locale} messages={messages}>
      <MainMenu />
    </IntlProvider>
  )
})
