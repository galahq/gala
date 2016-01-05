import React from 'react';
import ReactDOM from 'react-dom';

window.$ = require('jquery');

import CaseReader from './components/CaseReader.js'

import './stylesheets/main.scss';

ReactDOM.render(
  <CaseReader id="497" />
  , document.getElementById('container'));
