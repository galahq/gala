/**
 * @noflow
 */

import 'babel-polyfill'
import 'react-hot-loader/patch'

import React from 'react'
import ReactDOM from 'react-dom'

import { AppContainer } from 'react-hot-loader'
import { addLocaleData, IntlProvider } from 'react-intl'

import MainMenu from 'shared/MainMenu'

import loadMessages from '../../../config/locales'

import { FocusStyleManager } from '@blueprintjs/core'
FocusStyleManager.onlyShowFocusOnTabs()

const { locale } = (window.i18n: { locale: string })

delete AppContainer.prototype.unstable_handleError

const render = (Component: React$Component) => {
  Promise.all([
    import(`react-intl/locale-data/${locale.substring(0, 2)}`),
    loadMessages(locale),
  ]).then(([localeData, messages]) => {
    addLocaleData(localeData)
    ReactDOM.render(
      <AppContainer>
        <IntlProvider locale={locale} messages={messages}>
          <Component />
        </IntlProvider>
      </AppContainer>,
      document.getElementById('main-menu-app')
    )
  })
}

render(MainMenu)
