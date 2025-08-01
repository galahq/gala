/**
 * @providesModule Card
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'

import { EditorState, RichUtils } from 'draft-js'

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
import {
  applySmartTypography,
  handleCustomKeyBindings,
} from 'shared/draftHelpers'

import type { DragHandleProps } from 'react-beautiful-dnd'
import type { ContextRouter } from 'react-router-dom'
import type { DraftHandleValue } from 'draft-js/lib/DraftHandleValue'

import type { Dispatch } from 'redux/actions'
import type { State, Citation } from 'redux/state'

/**
 * Public API for <Card />
 */
type OwnProps = {|
  ...ContextRouter,
  dragHandleProps: DragHandleProps,
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
  position: number,
  readOnly: boolean,
  selectedCommentThread: ?string,
  solid: boolean,
  theseCommentThreadsOpen: boolean,
|}

function mapStateToProps (
  state: State,
  { id, location, nonNarrative }: OwnProps
): StateProps {
  const { solid, commentThreads, pageId, position } = state.cardsById[id]
  const editorState =
    state.cardsById[id].editorState || EditorState.createEmpty()
  const { openedCitation, hoveredCommentThread, acceptingSelection } = state.ui

  const { pathname } = location
  const theseCommentThreadsOpen = !!matchPath(pathname, commentThreadsOpen(id))
  const anyCommentThreadsOpen = !!matchPath(pathname, commentThreadsOpen())
  const anyCommentsOpen = matchPath(pathname, commentsOpen())
  const selectedCommentThread = anyCommentsOpen?.params.threadId

  const activeCommunity = state.caseData.reader?.activeCommunity
  const activeCommunityPresent = state.forums.some(
    forum => activeCommunity && forum.community.param === activeCommunity.param
  )

  return {
    acceptingSelection,
    anyCommentsOpen: !!anyCommentsOpen,
    anyCommentThreadsOpen,
    commentable:
      commentThreads != null &&
      !nonNarrative &&
      activeCommunityPresent &&
      state.caseData.commentable &&
      !!state.caseData.reader?.enrollment,
    deletable: !!pageId,
    editable: state.edit.inProgress,
    editing: state.edit.inProgress && editorState.getSelection().hasFocus,
    editorState,
    hoveredCommentThread,
    openedCitation,
    position,
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
      dispatch(applySelection(id, selection))
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
  keyBindingFn: SyntheticKeyboardEvent<*> => string,
  handleKeyCommand: string => DraftHandleValue,
  handleBeforeInput: (string, EditorState) => DraftHandleValue,
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

    handleKeyCommand: (command: string, editorState: EditorState) => {
      const newState =
        RichUtils.handleKeyCommand(editorState, command) ||
        handleCustomKeyBindings(editorState, command)

      if (newState == null) return 'not-handled'

      onChange(newState)
      return 'handled'
    },

    handleBeforeInput: (chars, editorState) => {
      let newState = applySmartTypography(chars, editorState)
      if (newState == null) return 'not-handled'

      onChange(newState)
      return 'handled'
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

// $FlowFixMe
export default withRouter(
  connect(
    // $FlowFixMe
    mapStateToProps,
    // $FlowFixMe
    mapDispatchToProps,
    // $FlowFixMe
    mergeProps
  )(withGetEdgenote(CardContents))
)
