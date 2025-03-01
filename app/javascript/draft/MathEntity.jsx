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
  const mathRef = React.useRef(null)

  if (error) {
    return null
  }

  /**
   * Handles zoom window close by ensuring focus is properly managed
   */
  const handleZoomClose = React.useCallback((event) => {
    // Prevent the default focus behavior
    event.preventDefault()
    
    // If we have a ref to our math container, focus it instead
    if (mathRef.current) {
      mathRef.current.focus()
    }
  }, [])

  /**
   * Dispatches the target selection when the user clicks on the MATH entity.
   * Problem is the MATH entity is an SVG instead of text, it's not recommended.
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
    <MathWrapper 
      ref={mathRef}
      editing={editInProgress} 
      onClick={handleClick}
      tabIndex={0} // Make the wrapper focusable
    >
      <CursorTarget>
        <Tex2SVG
          latex={decoratedText}
          display="inline"
          style={{}}
          onSuccess={() => setError(null)}
          onError={setError}
          onZoomClose={handleZoomClose} // Add handler for zoom close
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
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  overflow-x: auto;
  max-width: 656px;
  
  appearance: none;
  -webkit-appearance: none;
  
  vertical-align: middle;
  
  font-size: 0.7em;
  line-height: inherit;
  
  @media (max-width: 1440px) {
    max-width: 500px;
  }
  @media (max-width: 800px) {
    max-width: 200px;
  }
  
  ${({ editing }) => editing && `
    &:hover {
      cursor: text;
    }`}

  &>button {
    background: none;
  }
`

const CursorTarget = styled.div`
  cursor: zoom-in;
  display: inline-block;
  vertical-align: middle;
`
