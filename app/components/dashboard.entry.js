import React from 'react';
import { render } from 'react-dom';

import { Dashboard } from 'dashboard/Dashboard.js'

render((
  <Dashboard {...window.reader} />
), document.getElementById('dashboard-app'))
