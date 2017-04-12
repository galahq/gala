import React from 'react'

const LinkEntity = ({ contentState, entityKey, children }) => {
  let { href } = contentState.getEntity(entityKey).getData()
  return <a href={href}>{children}</a>
}

export default LinkEntity
