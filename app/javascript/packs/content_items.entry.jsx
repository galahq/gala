// @flow

import React from 'react'
import ReactDOM from 'react-dom'

import ContentItems from 'content_items'

function render (Component: React$Component) {
  const container = document.getElementById('content-items-app')

  if (container == null) return

  ReactDOM.render(
    <Component
      items={JSON.parse(container.getAttribute('data-items'))}
      returnUrl={container.getAttribute('data-return-url')}
      returnData={container.getAttribute('data-return-data')}
    />,
    container
  )
}

render(ContentItems)
