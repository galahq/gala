//
// Someday when Trackable has been refactored to use redux, I want this
// component to be merged with Card as the only redux powered card component,
// allowing EditableCard to be renamed CardContents
//

import React from 'react'
import { connect } from 'react-redux'

import { Editor, RichUtils, SelectionState} from 'draft-js'
import { blockRenderMap, customStyleMap } from 'concerns/draftConfig.js'
import { selectedCommentStyle } from 'concerns/commentThreads.js'

import EditorToolbar from 'EditorToolbar.js'
import Statistics from 'Statistics.js'
import CitationTooltip from 'CitationTooltip.js'

import { updateCardContents, applySelection } from 'redux/actions.js'

const mapStateToProps = (state, ownProps) => {
  let {solid, statistics, editorState} = state.cardsById[ownProps.id]

  return {
    editable: state.edit.inProgress,
    editing: state.edit.inProgress && editorState.getSelection().hasFocus,
    openedCitation: state.ui.openedCitation,
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
    onMakeSelectionForComment: eS => {
      const selection = eS.getSelection()
      if (!selection.getHasFocus())  return
      const selectionState = selection.isCollapsed()
        ? SelectionState.createEmpty(selection.getAnchorKey())
        : selection
      dispatch(applySelection(ownProps.id, selectionState))
    },
  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { editable } = stateProps
  const { onChangeContents, onMakeSelectionForComment } = dispatchProps

  const onChange = editable ? onChangeContents : onMakeSelectionForComment

  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,

    onChange,
    handleKeyCommand: command => {
      let newState = RichUtils.handleKeyCommand(stateProps.editorState, command)
      return newState ? onChange(newState) && 'handled' : 'not-handled'
    },
  }
}

class CardContents extends React.Component {
  render() {
    let {id, solid, editable, editing, editorState, onChange,
      handleKeyCommand, onDelete, openedCitation} = this.props

    let citationOpenWithinCard
    try {
      citationOpenWithinCard = citationInsideThisCard(this.cardRef, openedCitation.labelRef)
    } catch(e) {
      citationOpenWithinCard = false
    }

    return <div
      ref={el => this.cardRef = el}
      className={solid ? 'Card' : 'nonCard'}
      style={{transition: 'padding-top .1s', paddingTop: editing && '2em'}}
    >

      {editing && <EditorToolbar cardId={id} />}
      <Editor
        readOnly={openedCitation.key}
        customStyleMap={{...customStyleMap, 'thread--6': selectedCommentStyle}}
        {...{
          blockRenderMap,
          editorState,
          handleKeyCommand,
          onChange,
        }}
      />

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
