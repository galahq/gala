import React from 'react' // eslint-disable-line no-unused-vars
import { connect } from 'react-redux'
import { withRouter, matchPath } from 'react-router-dom'
import { commentThreadsOpen } from 'shared/routes'

import { highlightEdgenote, activateEdgenote } from 'redux/actions'

import type { State } from 'redux/state'

function mapStateToProps (
  state: State,
  { location, contentState, entityKey, children },
) {
  let { slug } = contentState.getEntity(entityKey).getData()
  return {
    editing: state.edit.inProgress,
    commentThreadsOpen: !!matchPath(location.pathname, commentThreadsOpen()),
    slug,
    children,
  }
}

function mapDispatchToProps (dispatch, ownProps) {
  let { slug } = ownProps.contentState.getEntity(ownProps.entityKey).getData()
  return {
    onMouseOver: () => dispatch(highlightEdgenote(slug)),
    onMouseOut: () => dispatch(highlightEdgenote(null)),
    onClick: () => dispatch(activateEdgenote(slug)),
  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    onClick: stateProps.commentThreadsOpen ? () => {} : dispatchProps.onClick,
    onMouseOver: stateProps.commentThreadsOpen
      ? () => {}
      : dispatchProps.onMouseOver,
  }
}

const EdgenoteSpan = (
  {
    editing,
    onMouseOver,
    onMouseOut,
    onClick,
    children,
    commentThreadsOpen,
    location,
  },
) => {
  return (
    <a
      className={`c-edgenote-entity${commentThreadsOpen ? '--inactive' : ''}`}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      onClick={editing ? () => {} : onClick}
    >
      {children.map(child =>
        React.cloneElement(child, { forceSelection: true, location }))}
    </a>
  )
}

const EdgenoteEntity = connect(mapStateToProps, mapDispatchToProps, mergeProps)(
  EdgenoteSpan,
)

export default withRouter(EdgenoteEntity)
