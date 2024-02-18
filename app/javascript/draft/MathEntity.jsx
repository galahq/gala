/**
 * @providesModule MathEntity
 * @noflow
 */

import React, { useState } from 'react'
import { EditorState, SelectionState, DraftOffsetKey } from 'draft-js'
import Tex2SVG from "react-hook-mathjax"
import { connect } from 'react-redux'
import { updateCardContents } from 'redux/actions'
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
    updateCardContents: (cardId, newEditorState) => dispatch(updateCardContents(cardId, newEditorState)),
  }
}

export function MathSpan (props) {
  const { decoratedText, entityKey, contentState, children, state, offsetKey, onChange, updateCardContents, location } = props

  const [error, setError] = useState(null)
  if (error) {
    return null
  }

  function handleClick () {
    const blockKey = offsetKey.split('-')[0]
    const { cardId } = contentState.getEntity(entityKey).getData()
    const card = state.cardsById[cardId]
    const editorState = card?.editorState || EditorState.createEmpty()
    const block = contentState.getBlockForKey(blockKey)

    const targetRange = new SelectionState({
      anchorKey: blockKey,
      anchorOffset: 0,
      focusKey: blockKey,
      focusOffset: block.getLength(),
    })

    const newEditorState = EditorState.forceSelection(editorState, targetRange)
    updateCardContents(cardId, newEditorState) // Dispatch the action here
    console.log("handleClick called")
  }

  function handleSvgClick (event) {
    const offsetKey = event.target.getAttribute('data-offset-key')
    const { blockKey, decoratorKey, leafKey } = DraftOffsetKey.decode(offsetKey)
    const { block, start, end } = contentState.getBlockForKey(blockKey).getEntityRanges(
      (value) => value === this.props.entityKey,
      (start, end) => ({ start, end })
    )[decoratorKey]

    const selection = SelectionState.createEmpty(blockKey)
      .set('anchorOffset', start)
      .set('focusOffset', end)

    const { cardId } = contentState.getEntity(entityKey).getData()
    const card = state.cardsById[cardId]
    const editorState = card?.editorState || EditorState.createEmpty()
    const eS = EditorState.forceSelection(editorState, selection)
    updateCardContents(cardId, eS)
  }

  // function handleClick () {
  //   console.log({ offsetKey })
  //   // Extract the blockKey from the offsetKey
  //   const blockKey = offsetKey.split('-')[0]
  //   const { cardId } = contentState.getEntity(entityKey).getData()
  //   // console.log({ cardId, state })
  //   const card = state.cardsById[cardId]
  //   // console.log({ card })
  //   const editorState = card.editorState
  //   // console.log({ blockKey, editorState })

  //   // const contentState = editorState.getCurrentContent()
  //   // console.log({ contentState, contentStateProps })
  //   const block = contentState.getBlockForKey(blockKey)
  //   console.log({ block })

  //   // const entity = contentState.getEntity(entityKey)
  //   // console.log({ entityKey })
  //   // console.log({ props })

  //   // const { cardId } = contentState.getEntity(entityKey).getData()

  //   const targetRange = new SelectionState({
  //     anchorKey: blockKey,
  //     anchorOffset: 0,
  //     focusKey: blockKey,
  //     focusOffset: block.getLength(),
  //   })
  //   console.log({ targetRange })
  //   window.newEditorState = EditorState.forceSelection(editorState, targetRange)
  //   console.log({ newEditorState })
  // }

  return (
    <span
      data-offset-key={offsetKey}
      onClick={handleSvgClick}
    >
      <Tex2SVG
        latex={decoratedText}
        display="block"
        onSuccess={() => setError(null)}
        onError={setError}
      />
    </span>
  )
}

const MathEntity = connect(mapStateToProps, mapDispatchToProps)(MathSpan)

export default MathEntity
