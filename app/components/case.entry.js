import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, useRouterHistory } from 'react-router'
import { createHashHistory } from 'history'

import Case from 'Case.js'
import CaseReader from 'CaseReader.js'
import {CaseOverview} from 'CaseOverview.js'
import EdgenoteGallery from 'EdgenoteGallery.js'
import {PodcastOverview} from 'Podcast.js'
import EdgenoteContents from 'EdgenoteContents.js'

const appHistory = useRouterHistory(createHashHistory)({ queryKey: false  })

render((
  <Router history={appHistory}>
    <Route path="/(edit)" component={Case}>
      <IndexRoute component={CaseOverview} />
      <Route onEnter={() => window.scrollTo(0, 0)} path="edgenotes" component={EdgenoteGallery}>
        <Route path=":edgenoteID" component={EdgenoteContents} />
      </Route>
      <Route onEnter={() => window.scrollTo(0, 0)} path=":selectedPage" component={CaseReader}>
        <Route path="edgenotes/:edgenoteID" component={EdgenoteContents} />
      </Route>
      <Route path="podcasts/:podcastID" component={PodcastOverview} />
    </Route>
  </Router>
), document.getElementById('container'))
