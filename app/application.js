import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRedirect, browserHistory } from 'react-router'

window.$ = require('jquery');

import CaseReader from './components/CaseReader.js'
import Narrative from './components/Narrative.js'

render((
  <Router onUpdate={() => window.scrollTo(0, 0)} history={browserHistory}>
    <Route path="/read/:id(/)" component={CaseReader}>
      <IndexRedirect to="0" />
      <Route path=":chapter" component={Narrative} />
    </Route>
  </Router>
), document.getElementById('container'))
