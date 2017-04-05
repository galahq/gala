import React from 'react'
import { render } from 'react-dom'

import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'

import { FocusStyleManager } from '@blueprintjs/core'
FocusStyleManager.onlyShowFocusOnTabs()

import Case from 'Case'

import reducer from 'redux/reducers'

let store = createStore(
  reducer,
  applyMiddleware(
    thunk,
  )
)

import { addLocaleData, IntlProvider } from 'react-intl'
if (!global.Intl) { global.Intl = require('intl') }

import en from 'react-intl/locale-data/en'
import fr from 'react-intl/locale-data/fr'
import ja from 'react-intl/locale-data/ja'
import zh from 'react-intl/locale-data/zh'
import am from 'react-intl/locale-data/am'
addLocaleData([...en, ...fr, ...ja, ...zh, ...am])

import messages from 'locales.json'
const { locale } = window.i18n

render(
  <Provider store={store}>
    <IntlProvider locale={locale} messages={messages[locale]}>
      <Case />
    </IntlProvider>
  </Provider>,
  document.getElementById('container'),
)
