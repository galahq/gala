/**
 * @providesModule EdgenoteEntity
 * @flow
 */
import * as React from 'react'
import { connect } from 'react-redux'
import { withRouter, matchPath } from 'react-router-dom'
import { commentThreadsOpen } from 'shared/routes'
import { acceptKeyboardClick } from 'shared/keyboard'

import { highlightEdgenote, activateEdgenote } from 'redux/actions'
import { FormattedMessage } from 'react-intl'
import { LabelForScreenReaders } from 'utility/A11y'

import type { State } from 'redux/state'

function mapStateToProps (
  state: State,
  { location, contentState, entityKey, children }
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

const EdgenoteSpan = ({
  children,
  commentThreadsOpen,
  editing,
  location,
  onClick,
  onMouseOut,
  onMouseOver,
  slug,
}) => {
  return (
    <>
      <a
        tabIndex="0"
        className={`c-edgenote-entity${commentThreadsOpen ? '--inactive' : ''}`}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={editing ? () => {} : onClick}
        onKeyPress={acceptKeyboardClick}
      >
        {children.map(child =>
          React.cloneElement(child, { forceSelection: true, location })
        )}
      </a>
      <LabelForScreenReaders>
        <a id={`edgenote-highlight-${slug}`} href={`#edgenote-${slug}`}>
          <FormattedMessage id="edgenotes.edgenote.jumpToEdgenote" />
        </a>
      </LabelForScreenReaders>
    </>
  )
}

const EdgenoteEntity = connect(mapStateToProps, mapDispatchToProps, mergeProps)(
  EdgenoteSpan
)

// $FlowFixMe
export default withRouter(EdgenoteEntity)
