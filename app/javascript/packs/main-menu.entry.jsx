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

import { FocusStyleManager } from '@blueprintjs/core'
FocusStyleManager.onlyShowFocusOnTabs()

const { locale } = (window.i18n: { locale: string })
import messages from '../../../config/locales/react.json' // eslint-disable-line

delete AppContainer.prototype.unstable_handleError

const render = (Component: React$Component) => {
  ReactDOM.render(
    <AppContainer>
      <IntlProvider locale={locale} messages={messages[locale]}>
        <Component />
      </IntlProvider>
    </AppContainer>,
    document.getElementById('main-menu-app')
  )
}

import(`react-intl/locale-data/${locale.substring(0, 2)}`).then(m => {
  addLocaleData(m)
  render(MainMenu)
})
