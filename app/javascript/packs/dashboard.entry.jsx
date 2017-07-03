import React from 'react'
import { render } from 'react-dom'

import { Dashboard } from 'dashboard/Dashboard'

render(
  <Dashboard {...window.reader} />,
  document.getElementById('dashboard-app')
)
