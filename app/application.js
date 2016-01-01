import React from 'react';
import ReactDOM from 'react-dom';

import CaseReader from './components/CaseReader.js'

import './stylesheets/main.scss';

ReactDOM.render(
  <CaseReader title="Wolf Wars:  Should We Hunt Gray Wolves in Michigan?"/>
  , document.getElementById('container'));
