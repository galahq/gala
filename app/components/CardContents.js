//
// Someday when Trackable has been refactored to use redux, I want this
// component to be merged with Card as the only redux powered card component,
// allowing EditableCard to be renamed CardContents
//

import React from 'react'
import { connect } from 'react-redux'

import { Editor, RichUtils, SelectionState} from 'draft-js'
import { blockRenderMap, getStyleMap } from 'concerns/draftConfig.js'

import EditorToolbar from 'EditorToolbar.js'
import Statistics from 'Statistics.js'
import CitationTooltip from 'CitationTooltip.js'
import CommentThreadsTag from 'comments/CommentThreadsTag.js'
import CommentThreadsCard from 'comments/CommentThreadsCard.js'

import {
  updateCardContents,
  applySelection,
  createCommentThread,
} from 'redux/actions.js'

const mapStateToProps = (state, ownProps) => {
  const { solid, statistics, editorState } = state.cardsById[ownProps.id]
  const { openedCitation, hoveredCommentThread, selectedCommentThread,
    acceptingSelection } = state.ui
  const commentThreadsOpen = ownProps.id === state.ui.commentThreadsOpenForCard

  return {
    readerEnrolled: !!state.caseData.reader.enrollment,
    editable: state.edit.inProgress,
    editing: state.edit.inProgress && editorState.getSelection().hasFocus,
    readOnly: !((state.edit.inProgress && !openedCitation.key)
      || acceptingSelection),
    commentsOpen: !!selectedCommentThread,
    openedCitation,
    acceptingSelection,
    hoveredCommentThread,
    selectedCommentThread,
    commentThreadsOpen,
    solid,
    statistics,
    editorState,
  }
}

  //deleteCard() {
    //let confirmation = window.confirm("\
//Are you sure you want to delete this card and its contents?\n\n\
//Edgenotes attached to it will not be deleted, although they will be detached.\n\n\
//This action cannot be undone.")
    //if (!confirmation) { return }

    //Orchard.prune(`cards/${this.props.id}`).then((response) => {
      //this.props.didSave(response, false, 'deleted')
    //})
  //}
const mapDispatchToProps = (dispatch, ownProps) => {
  return {

    onChangeContents: eS => dispatch(updateCardContents(ownProps.id, eS)),

    onMakeSelectionForComment: (editorState) => {
      const selection = editorState.getSelection()
      if (!selection.getHasFocus())  return
      const selectionState = (
        selection.isCollapsed()
          || selection.getStartKey() !== selection.getEndKey()
      ) ? SelectionState.createEmpty(selection.getAnchorKey())
        : selection
      dispatch(applySelection(ownProps.id, selectionState))
    },

    createCommentThread: (cardId, editorState) =>
      dispatch(createCommentThread(cardId, editorState)),

  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { editable, editorState } = stateProps
  const { onChangeContents, onMakeSelectionForComment,
    createCommentThread } = dispatchProps

  const onChange = editable ? onChangeContents : onMakeSelectionForComment

  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,

    onChange,
    handleKeyCommand: command => {
      let newState = RichUtils.handleKeyCommand(editorState, command)
      return newState ? onChange(newState) && 'handled' : 'not-handled'
    },

    addCommentThread: () => {
      if (!editable && !editorState.getSelection().isCollapsed()) {
        createCommentThread(ownProps.id, editorState)
      }
    },
  }
}

class CardContents extends React.Component {
  render() {
    let {id, solid, editable, editing, editorState, onChange,
      handleKeyCommand, onDelete, openedCitation, addCommentThread,
      commentThreadsOpen, commentsOpen, acceptingSelection,
      hoveredCommentThread, selectedCommentThread, readOnly,
      readerEnrolled} = this.props

    let citationOpenWithinCard
    try {
      citationOpenWithinCard = citationInsideThisCard(this.cardRef, openedCitation.labelRef)
    } catch(e) {
      citationOpenWithinCard = false
    }

    const styleMap = getStyleMap({commentThreadsOpen, hoveredCommentThread,
      selectedCommentThread})

    return <div
      ref={el => this.cardRef = el}
      className={`${solid ? 'Card' : 'nonCard'} ${commentsOpen ? "has-comments-open" : ""} ${acceptingSelection ? 'accepting-selection' : ''}`}
      style={{
        paddingTop: editing && '2em',
        zIndex: commentThreadsOpen && 300,
        transition: "padding-top 0.1s",
      }}
    >

      {editing && <EditorToolbar cardId={id} />}
      <Editor ref={ed => this.editor = ed}
        readOnly={readOnly}
        customStyleMap={styleMap}
        onChange={eS => onChange(eS)}
        {...{
          blockRenderMap,
          editorState,
          handleKeyCommand,
        }}
      />

      {readerEnrolled && solid && <CommentThreadsTag cardId={id} />}
      { commentThreadsOpen && <CommentThreadsCard cardId={id}
        addCommentThread={addCommentThread} /> }

      {
        citationOpenWithinCard && <CitationTooltip cardId={id}
          cardWidth={this.cardRef.clientWidth}
          {...{openedCitation, editable }}
        />
      }

      { solid && !editable && <Statistics uri={`cards::${id}`} /> }
    </div>
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(CardContents)

function citationInsideThisCard(card, citation) {
  if (!card || !citation)  return false
  if (card === citation) return true
  return citationInsideThisCard(card, citation.parentElement)
}
