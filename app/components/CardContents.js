//
// Someday when Trackable has been refactored to use redux, I want this
// component to be merged with Card as the only redux powered card component,
// allowing EditableCard to be renamed CardContents
//

import React from 'react'
import { connect } from 'react-redux'

import { Editor, RichUtils, SelectionState} from 'draft-js'
import { blockRenderMap, customStyleMap } from 'concerns/draftConfig.js'
import {
  openCommentsStyle,
  selectedCommentStyle,
} from 'concerns/commentThreads.js'

import EditorToolbar from 'EditorToolbar.js'
import Statistics from 'Statistics.js'
import CitationTooltip from 'CitationTooltip.js'
import CommentThreadsTag from 'comments/CommentThreadsTag.js'
import CommentsCard from 'comments/CommentsCard.js'

import {
  updateCardContents,
  applySelection,
  createCommentThread,
} from 'redux/actions.js'

const mapStateToProps = (state, ownProps) => {
  let {solid, statistics, editorState} = state.cardsById[ownProps.id]

  return {
    editable: state.edit.inProgress,
    editing: state.edit.inProgress && editorState.getSelection().hasFocus,
    openedCitation: state.ui.openedCitation,
    commentThreadsOpen: ownProps.id === state.ui.commentThreadsOpenForCard,
    selectedCommentThread: state.ui.selectedCommentThread,
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

    onMakeSelectionForComment: (editorState, editor) => {
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

    addHighlight: () => {
      if (!editable && !editorState.getSelection().isCollapsed()) {
        createCommentThread(ownProps.id, editorState)
      }
    },
  }
}

class CardContents extends React.Component {
  render() {
    let {id, solid, editable, editing, editorState, onChange,
      handleKeyCommand, onDelete, openedCitation, addHighlight,
      commentThreadsOpen, commentsOpen, selectedCommentThread} = this.props

    let citationOpenWithinCard
    try {
      citationOpenWithinCard = citationInsideThisCard(this.cardRef, openedCitation.labelRef)
    } catch(e) {
      citationOpenWithinCard = false
    }

    const styleMap = {
      ...customStyleMap,
      ...(commentThreadsOpen ? {'THREAD': openCommentsStyle} : {}),
      ...(commentThreadsOpen && selectedCommentThread
           ? {[`thread--${selectedCommentThread}`]: selectedCommentStyle}
           : {}),
    }

    return <div
      ref={el => this.cardRef = el}
      className={`${solid ? 'Card' : 'nonCard'} ${commentsOpen && "has-comments-open"}`}
      style={{
        paddingTop: editing && '2em',
        zIndex: commentThreadsOpen && 300,
      }}
    >

      {editing && <EditorToolbar cardId={id} />}
      <Editor ref={ed => this.editor = ed}
        readOnly={openedCitation.key}
        customStyleMap={styleMap}
        onChange={eS => onChange(eS, this.editor)}
        {...{
          blockRenderMap,
          editorState,
          handleKeyCommand,
        }}
      />

      <CommentThreadsTag cardId={id} />
      { commentThreadsOpen && <CommentsCard cardId={id} /> }

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
