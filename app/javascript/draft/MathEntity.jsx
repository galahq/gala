/**
 * @providesModule MathEntity
 * @noflow
 */

import React, { useState } from 'react'
import { EditorState, SelectionState, DraftOffsetKey } from 'draft-js'
import Tex2SVG from "react-hook-mathjax"
import { connect } from 'react-redux'
import { updateCardContents, applySelection } from 'redux/actions'
import type { State } from 'redux/state'

function mapStateToProps (
  state: State
) {
  return {
    state,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    applySelection: (cardId, selectionState) => dispatch(applySelection(cardId, selectionState)),
  }
}

export function MathSpan (props) {
  console.log(props)
  const { decoratedText, offsetKey, contentState, entityKey, applySelection, state } = props
  window.currentState = state

  const [error, setError] = useState(null)
  if (error) {
    return null
  }

  function handleClick () {
    console.log({ offsetKey })
    // Extract the blockKey from the offsetKey
    const blockKey = offsetKey.split('-')[0]
    const { cardId } = contentState.getEntity(entityKey).getData()
    // console.log({ cardId, state })
    const card = state.cardsById[cardId]
    // console.log({ card })
    const editorState = card.editorState
    // console.log({ blockKey, editorState })

    // const contentState = editorState.getCurrentContent()
    // console.log({ contentState, contentStateProps })
    const block = contentState.getBlockForKey(blockKey)
    console.log({ block })

    // const entity = contentState.getEntity(entityKey)
    // console.log({ entityKey })
    // console.log({ props })

    // const { cardId } = contentState.getEntity(entityKey).getData()

    const targetRange = new SelectionState({
      anchorKey: blockKey,
      anchorOffset: 3,
      focusKey: blockKey,
      focusOffset: block.getLength(),
    })
    console.log({ targetRange })
    applySelection(cardId, targetRange)
    // window.newEditorState = EditorState.forceSelection(editorState, targetRange)
    // console.log({ newEditorState })
  }

  const { content } = contentState.getEntity(entityKey).getData()
  console.log(content)

  return (
    <button zIndex={400} tabIndex={0} onClick={handleClick}>
      &nbsp;
        <Tex2SVG
          latex={content || decoratedText}
          display="inline"
          onSuccess={() => setError(null)}
          onError={setError}
        />
      &nbsp;
    </button>
  )
}

const MathEntity = connect(mapStateToProps, mapDispatchToProps)(MathSpan)

export default MathEntity
