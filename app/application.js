import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router'

window.$ = require('jquery');

import Catalog from './components/Catalog.js'
import Case from './components/Case.js'
import CaseReader from './components/CaseReader.js'
import {CaseOverview} from './components/CaseOverview.js'
import EdgenoteGallery from './components/EdgenoteGallery.js'
import Modal from './components/Modal.js'

class App extends React.Component {
  render() {
    return (
      <div id="App">
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
    <Route path="/" component={App}>
      <IndexRoute component={Catalog} />
      <Route path="read/:id" component={Case}>
        <IndexRoute component={CaseOverview} />
        <Route onEnter={() => window.scrollTo(0, 0)} path="edgenotes" component={EdgenoteGallery}>
          <Route path=":edgenoteID" component={Modal} />
        </Route>
        <Route onEnter={() => window.scrollTo(0, 0)} path=":chapter" component={CaseReader}>
          <Route path="edgenotes/:edgenoteID" component={Modal} />
        </Route>
      </Route>
    </Route>
  </Router>
), document.getElementById('container'))
