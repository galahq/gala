import React from 'react'

const LinkEntity = ({contentState, entityKey, children}) => {
  let data = contentState.getEntity(entityKey).getData()
  return <a {...data}>{children}</a>
}

export default LinkEntity
