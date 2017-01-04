//
// Someday when Trackable has been refactored to use redux, I want this
// component to be merged with Card as the only redux powered card component,
// allowing EditableCard to be renamed CardContents
//

import React from 'react'
import { connect } from 'react-redux'

import { Editor, RichUtils } from 'draft-js'
import { blockRenderMap, customStyleMap } from 'concerns/draftConfig.js'

import { Statistics } from 'Statistics.js'

import { updateCardContents } from 'redux/actions.js'

const mapStateToProps = (state, ownProps) => {
  let {solid, statistics, editorState} = state.cardsById[ownProps.id]

  return {
    //editing: state.editing,
    editing: ownProps.didSave !== null,
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
    onChange: eS => dispatch(updateCardContents(ownProps.id, eS)),
  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,

    handleKeyCommand: command => {
      let newState = RichUtils.handleKeyCommand(stateProps.editorState, command)
      return newState ? dispatchProps.onChange(newState) && 'handled' : 'not-handled'
    },
  }
}

const CardContents = ({solid, statistics, editing, editorState, onChange,
                      handleKeyCommand, onDelete}) =>
  <div className={solid ? 'Card' : 'nonCard'}>
    { editing && <a className="Card-delete-option" onClick={onDelete}>
      Delete card
    </a> }

    <Editor
      blockRenderMap={blockRenderMap}
      customStyleMap={customStyleMap}

      readOnly={!editing}
      editorState={editorState}

      handleKeyCommand={handleKeyCommand}
      onChange={onChange}
    />

    { solid && editing && <Statistics statistics={statistics} /> }
  </div>

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(CardContents)
