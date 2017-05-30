// @flow

import React from 'react'
import ReactDOM from 'react-dom'

import ContentItems from 'content_items'

const container = document.getElementById('content-items-app')

if (container != null) {
  ReactDOM.render(
    <ContentItems
      items={JSON.parse(container.getAttribute('data-items'))}
      groupId={container.getAttribute('data-group-id')}
      returnParams={JSON.parse(container.getAttribute('data-return-params'))}
    />,
    container
  )
}
