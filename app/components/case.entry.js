import React from 'react'
import { render } from 'react-dom'

import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'

import { Router, Route, IndexRoute, useRouterHistory, Redirect } from 'react-router'
import { createHashHistory } from 'history'

import { addLocaleData, IntlProvider } from 'react-intl'

import Case from 'Case.js'
import CaseReader from 'CaseReader.js'
import CaseOverview from 'CaseOverview.js'
import EdgenoteGallery from 'EdgenoteGallery.js'
import {PodcastOverview} from 'Podcast.js'
import EdgenoteContents from 'EdgenoteContents.js'

import reducer from 'redux/reducers.js'

let store = createStore(
  reducer,
  applyMiddleware(
    thunk,
  )
)

const appHistory = useRouterHistory(createHashHistory)({ queryKey: false  })

let authenticatedRoutes = [
  <Route onEnter={() => window.scrollTo(0, 0)} path="edgenotes" component={EdgenoteGallery}>
    <Route path=":edgenoteID" component={EdgenoteContents} />
  </Route>,
  <Route onEnter={() => window.scrollTo(0, 0)} path=":selectedPage" component={CaseReader}>
    <Route path="edgenotes/:edgenoteID" component={EdgenoteContents} />
  </Route>,
  <Route path="podcasts/:podcastID" component={PodcastOverview} />,
]

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
      <Router history={appHistory}>
        <Route path="/(edit)" component={Case}>
          <IndexRoute component={CaseOverview} />

          { window.caseData.reader
            ? authenticatedRoutes
            : <Redirect from="*" to="/" /> }

          </Route>
        </Router>
      </IntlProvider>
    </Provider>,
  document.getElementById('container'),
)
