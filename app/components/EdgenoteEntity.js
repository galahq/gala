import React from 'react'  // eslint-disable-line no-unused-vars
import { connect } from 'react-redux'

import { highlightEdgenote, activateEdgenote } from 'redux/actions.js'

const mapStateToProps = (state, ownProps) => {
  let {slug} = ownProps.contentState.getEntity(ownProps.entityKey).getData()
  return {
    children: ownProps.children,
    slug,
  }
}


const mapDispatchToProps = (dispatch, ownProps) => {
  let {slug} = ownProps.contentState.getEntity(ownProps.entityKey).getData()
  return {
    onMouseOver: () => {dispatch( highlightEdgenote(slug) )},
    onMouseOut: () => {dispatch( highlightEdgenote(null) )},
    onClick: () => {dispatch( activateEdgenote(slug) )},
  }
}

const EdgenoteSpan = ({slug, onMouseOver, onMouseOut, onClick, children}) => {
  return <a
    data-edgenote={slug}
    onMouseOver={onMouseOver}
    onMouseOut={onMouseOut}
    onClick={onClick}
  >
    {children}
  </a>
}

const EdgenoteEntity = connect(mapStateToProps, mapDispatchToProps)(EdgenoteSpan)

export default EdgenoteEntity
