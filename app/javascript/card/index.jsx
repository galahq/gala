/**
 * @providesModule Card
 * @flow
 */

import { connect } from 'react-redux'

import { EditorState, RichUtils, SelectionState } from 'draft-js'

import CardContents from './CardContents'

import {
  updateCardContents,
  applySelection,
  createCommentThread,
} from 'redux/actions'

import { withRouter, matchPath } from 'react-router-dom'
import { commentThreadsOpen, commentsOpen } from 'shared/routes'

import type { ContextRouter } from 'react-router-dom'

import type { Dispatch } from 'redux/actions'
import type { State } from 'redux/state'

/**
 * Public API for <Card />
 */
export type CardProps = {
  id: string,
  nonNarrative: boolean,
  title?: React$Element<{}>,
}

type OwnProps = ContextRouter & {
  id: string,
  nonNarrative: boolean,
}

function mapStateToProps (
  state: State,
  { id, location, nonNarrative }: OwnProps
) {
  const { solid, commentThreads } = state.cardsById[id]
  const editorState =
    state.cardsById[id].editorState || EditorState.createEmpty()
  const { openedCitation, hoveredCommentThread, acceptingSelection } = state.ui

  const { pathname } = location
  const theseCommentThreadsOpen = matchPath(pathname, commentThreadsOpen(id))
  const anyCommentThreadsOpen = matchPath(pathname, commentThreadsOpen())
  const anyCommentsOpen = matchPath(pathname, commentsOpen())
  const selectedCommentThread =
    anyCommentsOpen && anyCommentsOpen.params.commentThreadId

  return {
    commentable:
      commentThreads != null &&
      !nonNarrative &&
      state.caseData.commentable &&
      !!(state.caseData.reader && state.caseData.reader.enrollment),
    editable: state.edit.inProgress,
    editing: state.edit.inProgress && editorState.getSelection().hasFocus,
    readOnly: !(
      (state.edit.inProgress && !openedCitation.key) ||
      acceptingSelection
    ),
    anyCommentsOpen,
    openedCitation,
    acceptingSelection,
    hoveredCommentThread,
    selectedCommentThread,
    theseCommentThreadsOpen,
    anyCommentThreadsOpen,
    solid,
    editorState,
  }
}

function mapDispatchToProps (dispatch: Dispatch, ownProps: OwnProps) {
  return {
    onChangeContents: (eS: EditorState) =>
      dispatch(updateCardContents(ownProps.id, eS)),

    onMakeSelectionForComment: (eS: EditorState) => {
      const selection = eS.getSelection()
      if (!selection.getHasFocus()) return
      const selectionState =
        selection.isCollapsed() ||
        selection.getStartKey() !== selection.getEndKey()
          ? SelectionState.createEmpty(selection.getAnchorKey())
          : selection
      dispatch(applySelection(ownProps.id, selectionState))
    },

    createCommentThread: (cardId: string, eS: EditorState) =>
      dispatch(createCommentThread(cardId, eS)),
  }
}

function mergeProps (stateProps, dispatchProps, ownProps: OwnProps) {
  const { editable, editorState } = stateProps
  const {
    onChangeContents,
    onMakeSelectionForComment,
    createCommentThread,
  } = dispatchProps
  const { history, location } = ownProps

  const onChange = editable ? onChangeContents : onMakeSelectionForComment

  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,

    onChange,
    handleKeyCommand: (command: string) => {
      let newState = RichUtils.handleKeyCommand(editorState, command)
      return newState ? onChange(newState) && 'handled' : 'not-handled'
    },

    addCommentThread: async () => {
      if (!editable && !editorState.getSelection().isCollapsed()) {
        const threadId: string = await createCommentThread(
          ownProps.id,
          editorState
        )
        const match = matchPath(location.pathname, commentThreadsOpen())
        match && history.replace(`${match.url}/${threadId}`)
      }
    },
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps, mergeProps)(CardContents)
)
