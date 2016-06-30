import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, useRouterHistory } from 'react-router'
import { createHashHistory } from 'history'

window.$ = require('jquery');

import Case from './components/Case.js'
import CaseReader from './components/CaseReader.js'
import {CaseOverview} from './components/CaseOverview.js'
import EdgenoteGallery from './components/EdgenoteGallery.js'
import {PodcastOverview} from './components/Podcast.js'
import Modal from './components/Modal.js'

const appHistory = useRouterHistory(createHashHistory)({ queryKey: false  })

render((
  <Router history={appHistory}>
    <Route path="/(edit)" component={Case}>
      <IndexRoute component={CaseOverview} />
      <Route onEnter={() => window.scrollTo(0, 0)} path="edgenotes" component={EdgenoteGallery}>
        <Route path=":edgenoteID" component={Modal} />
      </Route>
      <Route onEnter={() => window.scrollTo(0, 0)} path=":selectedSegment" component={CaseReader}>
        <Route path="edgenotes/:edgenoteID" component={Modal} />
      </Route>
      <Route path="podcast/:podcastID" component={PodcastOverview} />
    </Route>
  </Router>
), document.getElementById('container'))
