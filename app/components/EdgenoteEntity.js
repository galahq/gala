import React from 'react'  // eslint-disable-line no-unused-vars
import { connect } from 'react-redux'
import { Route, withRouter, matchPath } from 'react-router-dom'
import { commentThreadsOpen } from 'concerns/routes'

import { highlightEdgenote, activateEdgenote } from 'redux/actions.js'

const mapStateToProps = (state, {location, contentState, entityKey,
  children}) => {
  let {slug} = contentState.getEntity(entityKey).getData()
  return {
    editable: state.editable,
    commentThreadsOpen: !!matchPath(location.pathname, commentThreadsOpen()),
    slug,
    children,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  let {slug} = ownProps.contentState.getEntity(ownProps.entityKey).getData()
  return {
    onMouseOver: () => dispatch( highlightEdgenote(slug) ),
    onMouseOut: () => dispatch( highlightEdgenote(null) ),
    onClick: () => dispatch( activateEdgenote(slug) ),
  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    onClick: stateProps.commentThreadsOpen
      ? () => {}
      : dispatchProps.onClick,
    onMouseOver: stateProps.commentThreadsOpen
      ? () => {}
      : dispatchProps.onMouseOver,
  }
}

const EdgenoteSpan = ({editable, onMouseOver, onMouseOut, onClick,
                      children, commentThreadsOpen}) => {
  return <a
    className={`c-edgenote-entity${commentThreadsOpen ? "--inactive" : ""}`}
    onMouseOver={onMouseOver}
    onMouseOut={onMouseOut}
    onClick={editable ? null : onClick}
  >
    {children}
  </a>
}

const EdgenoteEntity = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(EdgenoteSpan)

export default withRouter(EdgenoteEntity)
