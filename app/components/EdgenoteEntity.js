import React from 'react'  // eslint-disable-line no-unused-vars
import { connect } from 'react-redux'

const mapStateToProps = (state, ownProps) => {
  let {slug} = ownProps.contentState.getEntity(ownProps.entityKey).getData()
  return {
    children: ownProps.children,
    slug: slug
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  let {slug} = ownProps.contentState.getEntity(ownProps.entityKey).getData()
  return {
    onMouseOver: () => {dispatch({type: 'HIGHLIGHT_EDGENOTE', edgenoteSlug: slug})},
    onMouseOut: () => {dispatch({type: 'HIGHLIGHT_EDGENOTE', edgenoteSlug: null})}
  }
}

const EdgenoteSpan = ({slug, onMouseOver, onMouseOut, children}) => {
  return <a
    data-edgenote={slug}
    onMouseOver={onMouseOver}
    onMouseOut={onMouseOut}
  >
    {children}
  </a>
}

const EdgenoteEntity = connect(mapStateToProps, mapDispatchToProps)(EdgenoteSpan)

export default EdgenoteEntity
