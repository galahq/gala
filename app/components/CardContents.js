//
// Someday when Trackable has been refactored to use redux, I want this
// component to be merged with Card as the only redux powered card component,
// allowing EditableCard to be renamed CardContents
//

import React from 'react'
import { connect } from 'react-redux'

import { Editor, RichUtils } from 'draft-js'
import { blockRenderMap, customStyleMap } from 'concerns/draftConfig.js'

import EditorToolbar from 'EditorToolbar.js'
import { Statistics } from 'Statistics.js'

import { updateCardContents } from 'redux/actions.js'

const mapStateToProps = (state, ownProps) => {
  let {solid, statistics, editorState} = state.cardsById[ownProps.id]

  return {
    //editable: state.editing,
    editable: ownProps.didSave !== null,
    editing: editorState.getSelection().hasFocus,
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

const CardContents = ({solid, statistics, editable, editing, editorState, onChange,
                      handleKeyCommand, onDelete}) =>
  <div className={solid ? 'Card' : 'nonCard'} style={{transition: 'padding-top .1s', paddingTop: editing && '2em'}}>

    {editing && <EditorToolbar editorState={editorState} onChange={onChange} />}
    <Editor
      blockRenderMap={blockRenderMap}
      customStyleMap={customStyleMap}

      readOnly={!editable}
      editorState={editorState}

      handleKeyCommand={handleKeyCommand}
      onChange={onChange}
    />

    { solid && editable && <Statistics statistics={statistics} /> }
  </div>

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(CardContents)
