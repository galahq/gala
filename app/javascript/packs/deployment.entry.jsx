/**
 * @noflow
 */

import 'babel-polyfill'
import 'react-hot-loader/patch'

import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { addLocaleData, IntlProvider } from 'react-intl'

import Deployment from 'deployment'

import { ThemeProvider } from 'styled-components'
import { theme } from 'utility/styledComponents'

import { FocusStyleManager } from '@blueprintjs/core'
FocusStyleManager.onlyShowFocusOnTabs()

const { locale } = (window.i18n: { locale: string })
import loadMessages from '../../../config/locales' // eslint-disable-line

const container = document.getElementById('deployment-app')

delete AppContainer.prototype.unstable_handleError

const render = Component => {
  Promise.all([
    import(`react-intl/locale-data/${locale.substring(0, 2)}`),
    loadMessages(locale),
  ]).then(([localeData, messages]) => {
    addLocaleData(localeData)
    ReactDOM.render(
      <AppContainer>
        <IntlProvider locale={locale} messages={messages}>
          <ThemeProvider theme={theme}>
            <Component {...JSON.parse(container.getAttribute('data-params'))} />
          </ThemeProvider>
        </IntlProvider>
      </AppContainer>,
      container
    )
  })
}

render(Deployment)

if (module.hot) {
  module.hot.accept('deployment', () => {
    render(Deployment)
  })
}
