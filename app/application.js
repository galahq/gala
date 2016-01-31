import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRedirect, browserHistory } from 'react-router'

window.$ = require('jquery');

import CaseReader from './components/CaseReader.js'
import Narrative from './components/Narrative.js'
import Modal from './components/Modal.js'

render((
  <Router history={browserHistory}>
    <Route path="/read/:id(/)" component={CaseReader}>
      <IndexRedirect to="0" />
      <Route onEnter={() => window.scrollTo(0, 0)} path=":chapter" component={Narrative}>
        <Route path="edgenotes/:edgenoteID" component={Modal} />
      </Route>
    </Route>
  </Router>
), document.getElementById('container'))
