/**
 * @providesModule Card
 *
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
import {
  applySmartTypography,
  handleCustomKeyBindings,
} from 'shared/draftHelpers'



/**
 * Public API for <Card />
 */


function mapStateToProps (
  state,
  { id, location, nonNarrative }
) {
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

function mapDispatchToProps (
  dispatch,
  { id }
) {
  return {
    onChangeContents: (eS) => {
      dispatch(updateCardContents(id, eS))
    },

    onMakeSelectionForComment: (eS) => {
      const selection = eS.getSelection()
      if (!selection.getHasFocus()) return
      const contentState = eS.getCurrentContent()
      const blockKey = selection.getAnchorKey()
      const block = contentState.getBlockForKey(blockKey)

      // Check if selection contains any entities - if so, prevent comment creation
      // to avoid wrapping entities in CommentThreadEntity which breaks functionality
      const hasEntityInSelection = !selection.isCollapsed() &&
        selection.getStartKey() === selection.getEndKey() &&
        (() => {
          const selectionStart = selection.getStartOffset()
          const selectionEnd = selection.getEndOffset()
          let foundEntity = false

          block.findEntityRanges(
            char => char.getEntity() != null,
            (start, end) => {
              // check if entity overlaps with selection
              if (!(end <= selectionStart || start >= selectionEnd)) {
                foundEntity = true
              }
            }
          )

          return foundEntity
        })()

      const selectionState = hasEntityInSelection ||
        selection.isCollapsed() ||
        selection.getStartKey() !== selection.getEndKey()
        ? SelectionState.createEmpty(selection.getAnchorKey())
        : selection

      dispatch(applySelection(id, selectionState))
    },

    createCommentThread: (cardId, eS) =>
      dispatch(createCommentThread(cardId, eS)),

    handleDeleteCard: () => dispatch(deleteCard(id)),
  }
}

function mergeProps (
  stateProps,
  dispatchProps,
  ownProps
) {
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
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,

    onChange,

    handleKeyCommand: (command, editorState) => {
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
        const threadId = await createCommentThread(
          ownProps.id,
          editorState
        )
        const match = matchPath(location.pathname, commentThreadsOpen())
        match && threadId && history.replace(`${match.url}/${threadId}`)
      }
    },
  }
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )(withGetEdgenote(CardContents))
)
