/**
 * @noflow
 */

import React from 'react'
import ReactDOM from 'react-dom'

import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { enableBatching } from 'redux-batched-actions'
import thunk from 'redux-thunk'

import { ThemeProvider } from 'styled-components'
import { theme } from 'utility/styledComponents'

import { addLocaleData, IntlProvider } from 'react-intl'

import Case from 'Case'
import ErrorBoundary from 'utility/ErrorBoundary'

import reducer from 'redux/reducers'

import loadMessages from '../../../config/locales'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(
  enableBatching(reducer),
  composeEnhancers(applyMiddleware(thunk))
)

const { locale } = (window.i18n: { locale: string })

Promise.all([
  import(`react-intl/locale-data/${locale.substring(0, 2)}`),
  loadMessages(locale),
]).then(([localeData, messages]) => {
  addLocaleData(localeData)
  ReactDOM.render(
    <ErrorBoundary>
      <Provider store={store}>
        <IntlProvider locale={locale} messages={messages}>
          <ThemeProvider theme={theme}>
            <Case />
          </ThemeProvider>
        </IntlProvider>
      </Provider>
    </ErrorBoundary>,
    document.getElementById('container')
  )
})
