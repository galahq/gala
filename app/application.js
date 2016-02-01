import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router'

window.$ = require('jquery');

import CaseReader from './components/CaseReader.js'
import CaseOverview from './components/CaseOverview.js'
import Modal from './components/Modal.js'

class App extends React.Component {
  render() {
    return (
      <div id="container">
        <header>
          <h1 id="logo" dangerouslySetInnerHTML={{__html: require('./images/msc-logo.svg')}} />
        </header>
        {this.props.children}
      </div>
    )
  }
}

render((
  <Router history={browserHistory}>
    <Route path="/read/:id" component={App}>
      <IndexRoute component={CaseOverview} />
      <Route onEnter={() => window.scrollTo(0, 0)} path=":chapter" component={CaseReader}>
        <Route path="edgenotes/:edgenoteID" component={Modal} />
      </Route>
    </Route>
  </Router>
), document.getElementById('container'))
