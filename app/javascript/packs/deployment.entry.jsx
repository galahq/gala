/**
 * @flow
 */

import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'

import Deployment from 'Deployment'

import { FocusStyleManager } from '@blueprintjs/core'
FocusStyleManager.onlyShowFocusOnTabs()

const container = document.getElementById('deployment-app')

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Component {...JSON.parse(container.getAttribute('data-params'))} />
    </AppContainer>,
    container
  )
}

render(Deployment)

if (module.hot) {
  module.hot.accept('Deployment', () => {
    render(Deployment)
  })
}
