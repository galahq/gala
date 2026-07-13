/**
 * 
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import { IntlProvider } from 'react-intl'

import Deployment from 'deployment'

import { ThemeProvider } from 'styled-components'
import { theme } from 'utility/styledComponents'

const { locale } = (window.i18n)
import loadMessages from '../../../config/locales' // eslint-disable-line

const container = document.getElementById('deployment-app')

loadMessages(locale).then((messages) => {
  createRoot(container).render(
    <IntlProvider locale={locale} messages={messages}>
      <ThemeProvider theme={theme}>
        <Deployment {...JSON.parse(container.getAttribute('data-params'))} />
      </ThemeProvider>
    </IntlProvider>
  )
})
