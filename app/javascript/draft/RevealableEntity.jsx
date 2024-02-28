/**
 * @providesModule RevealableEntity
 * @flow
 */

import React, { useState } from 'react'
import { EditorState, SelectionState } from 'draft-js'
import { connect } from 'react-redux'
import { applySelection } from 'redux/actions'
import type { State } from 'redux/state'

// TODO determine if we need to connect to the redux store
// function mapStateToProps (
//   state: State,
//   { decoratedText, offsetKey, contentState, entityKey, children, location }
// ) {
//   const { cardId } = contentState.getEntity(entityKey).getData()
//   return {
//     cardId,
//     editInProgress: state.edit.inProgress,
//     editorState: state.cardsById[cardId]?.editorState || EditorState.createEmpty(),
//   }
// }

// function mapDispatchToProps (dispatch) {
//   return {
//     applySelection: (cardId, selectionState) => dispatch(applySelection(cardId, selectionState)),
//   }
// }

function RevealableEntity (props) {
  console.log("RevealableEntity props", props)
  // TODO figure what props are actually needed
  const { decoratedText, offsetKey, contentState, entityKey, applySelection, editInProgress, cardId, children, location } = props

  const [reveal, setReveal] = useState(false)

  // TODO add screen reader capabilities
  return (
    <a className={`c-revealable-entity${reveal ? '--reveal' : ''}`}
       onClick={() => setReveal(!reveal)}
    >
      {children.map(child =>
        React.cloneElement(child, { forceSelection: true })
      )}
    </a>
  )
}

// $FlowFixMe
// const RevealableEntity = connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(RevealableSpan)

export default RevealableEntity
