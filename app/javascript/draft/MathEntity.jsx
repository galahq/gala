/**
 * @providesModule MathEntity
 * @flow
 */

import React, { useState } from 'react'
import { EditorState, SelectionState } from 'draft-js'
import Tex2SVG from "react-hook-mathjax"
import { connect } from 'react-redux'
import { applySelection } from 'redux/actions'
import type { State } from 'redux/state'
import styled from 'styled-components'

function mapStateToProps (
  state: State,
  { decoratedText, offsetKey, contentState, entityKey }
) {
  const { cardId } = contentState.getEntity(entityKey).getData()
  return {
    cardId,
    editInProgress: state.edit.inProgress,
    editorState: state.cardsById[cardId]?.editorState || EditorState.createEmpty(),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    applySelection: (cardId, selectionState) => dispatch(applySelection(cardId, selectionState)),
  }
}

function MathComponent (props) {
  const { decoratedText, offsetKey, contentState, entityKey, applySelection, editInProgress, cardId } = props

  const [error, setError] = useState(null)
  if (error) {
    return null
  }

  /**
  * Dispatches the target selection when the user clicks on the MATH entity.
  * Problem is the MATH entity is an SVG instead of text, it's not recommend.
  * For more info on the problem see:
  * https://draftjs.org/docs/advanced-topics-block-components/
  */
  function handleClick () {
    if (!editInProgress) {
      return
    }
    // Extract the blockKey from the offsetKey
    const blockKey = offsetKey.split('-')[0]
    const block = contentState.getBlockForKey(blockKey)
    block.findEntityRanges(character => {
      const e = character.getEntity()
      return e === entityKey
    }, (start, end) => {
      const selection = new SelectionState({
        anchorKey: blockKey,
        anchorOffset: start,
        focusKey: blockKey,
        focusOffset: end,
      })
      applySelection(cardId, selection)
    })
  }

  // To select the MATH entity, click right before or after the equation.
  return (
    <MathWrapper editing={editInProgress} onClick={handleClick}>
      <CursorTarget>
        <Tex2SVG
          latex={decoratedText}
          display="inline"
          style={""}
          onSuccess={() => setError(null)}
          onError={setError}
        />
      </CursorTarget>
    </MathWrapper>
  )
}

// $FlowFixMe
const MathEntity = connect(
  mapStateToProps,
  mapDispatchToProps
)(MathComponent)

export default MathEntity
const MathWrapper = styled.button`
  border: solid 1px #c0bca9;
  border-radius: 3px;
  padding: 8px;
  overflow-x: auto;
  max-width: 656px;
  @media (max-width: 1440px) {
    max-width: 500px;
  }
  ${({ editing }) => editing && `
    &:hover {
      cursor: text;
      }`}

  &>button {
    background-color: red;
  }
`

const CursorTarget = styled.div`
 cursor: zoom-in;
`
