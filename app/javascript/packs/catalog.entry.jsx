/**
 * @noflow
 */

import 'babel-polyfill'
import 'react-hot-loader/patch'

import React from 'react'
import ReactDOM from 'react-dom'

import { AppContainer } from 'react-hot-loader'
import { IntlProvider } from 'react-intl'

import { FocusStyleManager } from '@blueprintjs/core'

import Catalog from 'catalog'

FocusStyleManager.onlyShowFocusOnTabs()

const { locale } = (window.i18n: { locale: string })
import messages from '../../../config/locales/react.json' // eslint-disable-line

const render = (Component: React$Component) => {
  ReactDOM.render(
    <AppContainer>
      <IntlProvider locale={locale} messages={messages[locale]}>
        <Component />
      </IntlProvider>
    </AppContainer>,
    document.getElementById('catalog-app')
  )
}

render(Catalog)

if (module.hot) {
  module.hot.accept('Catalog', () => {
    render(Catalog)
  })
}
