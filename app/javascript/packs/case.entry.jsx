/**
 * @noflow
 */

import 'babel-polyfill'
import 'react-hot-loader/patch'

import React from 'react'
import ReactDOM from 'react-dom'

import { AppContainer } from 'react-hot-loader'

import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { enableBatching } from 'redux-batched-actions'
import thunk from 'redux-thunk'

import { ThemeProvider } from 'styled-components'
import { theme } from 'utility/styledComponents'

import { FocusStyleManager } from '@blueprintjs/core'
import { addLocaleData, IntlProvider } from 'react-intl'

import Case from 'Case'
import ErrorBoundary from 'utility/ErrorBoundary'

import reducer from 'redux/reducers'

import loadMessages from '../../../config/locales'

FocusStyleManager.onlyShowFocusOnTabs()

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(
  enableBatching(reducer),
  composeEnhancers(applyMiddleware(thunk))
)

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
        <ErrorBoundary>
          <Provider store={store}>
            <IntlProvider locale={locale} messages={messages}>
              <ThemeProvider theme={theme}>
                <Component />
              </ThemeProvider>
            </IntlProvider>
          </Provider>
        </ErrorBoundary>
      </AppContainer>,
      document.getElementById('container')
    )
  })
}

render(Case)

if (module.hot) {
  module.hot.accept('Case', () => {
    render(Case)
  })
}
