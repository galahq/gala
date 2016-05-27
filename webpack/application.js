import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, hashHistory } from 'react-router'

window.$ = require('jquery');

import Case from './components/Case.js'
import CaseReader from './components/CaseReader.js'
import {CaseOverview} from './components/CaseOverview.js'
import EdgenoteGallery from './components/EdgenoteGallery.js'
import Modal from './components/Modal.js'

window.i18n = {}
window.i18n.locale = 'ja'

render((
  <Router history={hashHistory}>
    <Route path="/" component={Case}>
      <IndexRoute component={CaseOverview} />
      <Route onEnter={() => window.scrollTo(0, 0)} path="edgenotes" component={EdgenoteGallery}>
        <Route path=":edgenoteID" component={Modal} />
      </Route>
      <Route onEnter={() => window.scrollTo(0, 0)} path=":chapter" component={CaseReader}>
        <Route path="edgenotes/:edgenoteID" component={Modal} />
      </Route>
    </Route>
  </Router>
), document.getElementById('container'))
