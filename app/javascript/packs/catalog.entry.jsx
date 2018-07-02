/**
 * @noflow
 */

import 'babel-polyfill'
import 'react-hot-loader/patch'

import React from 'react'
import ReactDOM from 'react-dom'

import { AppContainer } from 'react-hot-loader'
import { addLocaleData, IntlProvider } from 'react-intl'

import { ThemeProvider } from 'styled-components'
import { theme } from 'utility/styledComponents'

import Catalog from 'catalog'

import loadMessages from '../../../config/locales'

const { locale } = (window.i18n: { locale: string })

const render = (Component: React$Component) => {
  Promise.all([
    import(`react-intl/locale-data/${locale.substring(0, 2)}`),
    loadMessages(locale),
  ]).then(([localeData, messages]) => {
    addLocaleData(localeData)
    ReactDOM.render(
      <AppContainer>
        <IntlProvider locale={locale} messages={messages}>
          <ThemeProvider theme={theme}>
            <Component />
          </ThemeProvider>
        </IntlProvider>
      </AppContainer>,
      document.getElementById('catalog-app')
    )
  })
}

render(Catalog)

if (module.hot) {
  module.hot.accept('catalog', () => {
    render(Catalog)
  })
}
