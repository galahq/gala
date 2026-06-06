import React from 'react'
import { createRoot } from 'react-dom/client'
import { IntlProvider } from 'react-intl'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { enableBatching } from 'redux-batched-actions'
import thunk from 'redux-thunk'
import { ThemeProvider } from 'styled-components'

import { theme } from 'utility/styledComponents'
import ErrorBoundary from 'utility/ErrorBoundary'
import Case from 'Case'
import reducer from 'redux/reducers'

export async function mount ({ locale, loadMessages }) {
  const container = document.getElementById('container')
  if (container == null || window.caseData == null) return

  const messages = await loadMessages(locale)
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
  const store = createStore(
    enableBatching(reducer),
    composeEnhancers(applyMiddleware(thunk))
  )

  createRoot(container).render(
    <ErrorBoundary>
      <Provider store={store}>
        <IntlProvider locale={locale} messages={messages}>
          <ThemeProvider theme={theme}>
            <Case />
          </ThemeProvider>
        </IntlProvider>
      </Provider>
    </ErrorBoundary>
  )
}
