/**
 * @providesModule Card
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'

import { EditorState, RichUtils, SelectionState } from 'draft-js'

import CardContents from './CardContents'

import {
  updateCardContents,
  applySelection,
  createCommentThread,
  deleteCard,
} from 'redux/actions'

import { withRouter, matchPath } from 'react-router-dom'
import { commentThreadsOpen, commentsOpen } from 'shared/routes'
import withGetEdgenote from './withGetEdgenote'

import type { ContextRouter } from 'react-router-dom'
import type { DraftHandleValue } from 'draft-js/lib/DraftHandleValue'

import type { Dispatch } from 'redux/actions'
import type { State, Citation } from 'redux/state'

/**
 * Public API for <Card />
 */
type OwnProps = {|
  ...ContextRouter,
  id: string,
  nonNarrative: boolean,
  title?: React.Node,
|}

type StateProps = {|
  acceptingSelection: boolean,
  anyCommentsOpen: boolean,
  anyCommentThreadsOpen: boolean,
  commentable: boolean,
  editable: boolean,
  editing: boolean,
  editorState: EditorState,
  deletable: boolean,
  hoveredCommentThread: ?string,
  openedCitation: Citation,
  readOnly: boolean,
  selectedCommentThread: ?string,
  solid: boolean,
  theseCommentThreadsOpen: boolean,
|}
function mapStateToProps (
  state: State,
  { id, location, nonNarrative }: OwnProps
): StateProps {
  const { solid, commentThreads, pageId } = state.cardsById[id]
  const editorState =
    state.cardsById[id].editorState || EditorState.createEmpty()
  const { openedCitation, hoveredCommentThread, acceptingSelection } = state.ui

  const { pathname } = location
  const theseCommentThreadsOpen = !!matchPath(pathname, commentThreadsOpen(id))
  const anyCommentThreadsOpen = !!matchPath(pathname, commentThreadsOpen())
  const anyCommentsOpen = matchPath(pathname, commentsOpen())
  const selectedCommentThread =
    anyCommentsOpen && anyCommentsOpen.params.threadId

  return {
    acceptingSelection,
    anyCommentsOpen: !!anyCommentsOpen,
    anyCommentThreadsOpen,
    commentable:
      commentThreads != null &&
      !nonNarrative &&
      state.caseData.commentable &&
      !!(state.caseData.reader && state.caseData.reader.enrollment),
    deletable: !!pageId,
    editable: state.edit.inProgress,
    editing: state.edit.inProgress && editorState.getSelection().hasFocus,
    editorState,
    hoveredCommentThread,
    openedCitation,
    readOnly: !(
      (state.edit.inProgress && !openedCitation.key) ||
      acceptingSelection
    ),
    selectedCommentThread,
    solid,
    theseCommentThreadsOpen,
  }
}

type DispatchProps = {|
  onChangeContents: EditorState => void,
  onMakeSelectionForComment: EditorState => void,
  createCommentThread: (cardId: string, eS: EditorState) => Promise<any>,
  handleDeleteCard: () => Promise<any>,
|}
function mapDispatchToProps (
  dispatch: Dispatch,
  { id }: OwnProps
): DispatchProps {
  return {
    onChangeContents: (eS: EditorState) => {
      dispatch(updateCardContents(id, eS))
    },

    onMakeSelectionForComment: (eS: EditorState) => {
      const selection = eS.getSelection()
      if (!selection.getHasFocus()) return
      const selectionState =
        selection.isCollapsed() ||
        selection.getStartKey() !== selection.getEndKey()
          ? SelectionState.createEmpty(selection.getAnchorKey())
          : selection
      dispatch(applySelection(id, selectionState))
    },

    createCommentThread: (cardId: string, eS: EditorState) =>
      dispatch(createCommentThread(cardId, eS)),

    handleDeleteCard: () => dispatch(deleteCard(id)),
  }
}

export type CardProps = {|
  ...OwnProps,
  ...StateProps,
  ...DispatchProps,
  addCommentThread: () => Promise<any>,
  onChange: EditorState => void,
  handleKeyCommand: string => DraftHandleValue,
  getEdgenote: () => Promise<string>,
|}
function mergeProps (
  stateProps: StateProps,
  dispatchProps: DispatchProps,
  ownProps: OwnProps
): CardProps {
  const { editable, editorState } = stateProps
  const {
    onChangeContents,
    onMakeSelectionForComment,
    createCommentThread,
  } = dispatchProps
  const { history, location } = ownProps

  const onChange = editable ? onChangeContents : onMakeSelectionForComment

  // Flow fails to infer exactness when exact objects are spread
  // https://github.com/facebook/flow/issues/2405
  // $FlowFixMe
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,

    onChange,
    handleKeyCommand: (command: string) => {
      let newState = RichUtils.handleKeyCommand(editorState, command)
      if (newState) {
        onChange(newState)
        return 'handled'
      }
      return 'not-handled'
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
  // $FlowFixMe
  connect(mapStateToProps, mapDispatchToProps, mergeProps)(
    withGetEdgenote(CardContents)
  )
)
