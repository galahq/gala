import React from 'react'
import { render } from 'react-dom'

import { createStore } from 'redux'
import { Provider } from 'react-redux'

import { Router, Route, IndexRoute, useRouterHistory, Redirect } from 'react-router'
import { createHashHistory } from 'history'

import Case from 'Case.js'
import CaseReader from 'CaseReader.js'
import {CaseOverview} from 'CaseOverview.js'
import EdgenoteGallery from 'EdgenoteGallery.js'
import {PodcastOverview} from 'Podcast.js'
import EdgenoteContents from 'EdgenoteContents.js'

const gala = (state, action) => {
  switch (action.type) {
    case 'HIGHLIGHT_EDGENOTE': return {...state, ui:{...state.ui, highlightedEdgenote: action.edgenoteSlug}}
    case 'ACTIVATE_EDGENOTE': return {...state, ui: {...state.ui, activeEdgenote: action.edgenoteSlug}}
    default: return state
  }
}
let store = createStore(gala, {
  edgenotesBySlug: window.caseData.edgenotes,
  ui: {
    highlightedEdgenote: null,
    activeEdgenote: null
  }
})
// Feed the edgenotes with the redux store, just for kicks.

const appHistory = useRouterHistory(createHashHistory)({ queryKey: false  })

let authenticatedRoutes = [
  <Route onEnter={() => window.scrollTo(0, 0)} path="edgenotes" component={EdgenoteGallery}>
    <Route path=":edgenoteID" component={EdgenoteContents} />
  </Route>,
  <Route onEnter={() => window.scrollTo(0, 0)} path=":selectedPage" component={CaseReader}>
    <Route path="edgenotes/:edgenoteID" component={EdgenoteContents} />
  </Route>,
  <Route path="podcasts/:podcastID" component={PodcastOverview} />
]

render((
  <Provider store={store}>
    <Router history={appHistory}>
      <Route path="/(edit)" component={Case}>
        <IndexRoute component={CaseOverview} />

        { window.caseData.reader
          ? authenticatedRoutes
          : <Redirect from="*" to="/" /> }

      </Route>
    </Router>
  </Provider>
), document.getElementById('container'))
