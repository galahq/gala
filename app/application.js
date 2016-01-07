import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router'

window.$ = require('jquery');

import CaseReader from './components/CaseReader.js'
import Narrative from './components/Narrative.js'

import './stylesheets/main.scss';

//ReactDOM.render(
  //<CaseReader id="497" />
  //, document.getElementById('container'));

    //<Route path="/read/:id(/chapter/:chapter)" component={CaseReader} />
ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/read/:id/" component={CaseReader}>
      <Route path=":chapter" component={Narrative} />
    </Route>
  </Router>
), document.getElementById('container'))
