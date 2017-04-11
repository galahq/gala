// @flow
import React from 'react'
import { render } from 'react-dom'

import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'

import { FocusStyleManager } from '@blueprintjs/core'
import { addLocaleData, IntlProvider } from 'react-intl'
import en from 'react-intl/locale-data/en'
import fr from 'react-intl/locale-data/fr'
import ja from 'react-intl/locale-data/ja'
import zh from 'react-intl/locale-data/zh'
import am from 'react-intl/locale-data/am'

import Case from 'Case'

import reducer from 'redux/reducers'

import messages from 'locales.json'; // eslint-disable-line

FocusStyleManager.onlyShowFocusOnTabs()

const store = createStore(reducer, applyMiddleware(thunk))

if (!global.Intl) {
  global.Intl = require('intl')
} // eslint-disable-line

addLocaleData([...en, ...fr, ...ja, ...zh, ...am])

const { locale } = (window.i18n: { locale: string })

render(
  <Provider store={store}>
    <IntlProvider locale={locale} messages={messages[locale]}>
      <Case />
    </IntlProvider>
  </Provider>,
  document.getElementById('container'),
)
