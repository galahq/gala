/**
 * @providesModule MathEntity
 * @flow
 */

import React, { useState, useRef } from 'react'
import { EditorState, SelectionState } from 'draft-js'
import Tex2SVG from "react-hook-mathjax"
import { connect } from 'react-redux'
import { applySelection } from 'redux/actions'
import type { State } from 'redux/state'
import styled from 'styled-components'

function mapStateToProps (
  state: State,
  { contentState, entityKey }
) {
  const { cardId } = contentState.getEntity(entityKey).getData()
  const card = state.cardsById[cardId]
  const lockKey = `Card/${cardId}`
  return {
    cardId,
    editInProgress: state.edit.inProgress,
    // Check if we have a valid lock
    hasValidLock: state.edit.inProgress && 
      state.locks[lockKey]?.reader?.param === `${state.caseData.reader?.id || ''}`,
    editorState: card?.editorState || EditorState.createEmpty(),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    applySelection: (cardId, selectionState) => dispatch(applySelection(cardId, selectionState)),
  }
}

// Create a wrapper component that handles the ref forwarding
const MathJaxWrapper = React.forwardRef(function MathJaxWrapper(props, ref) {
  return (
    <div ref={ref}>
      <Tex2SVG {...props} />
    </div>
  )
})

function MathComponent (props) {
  const { 
    decoratedText, 
    offsetKey, 
    contentState, 
    entityKey, 
    applySelection, 
    editInProgress,
    hasValidLock, 
    cardId
  } = props

  const [error, setError] = useState(null)
  const mathRef = useRef(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const texRef = useRef(null)

  if (error) {
    return null
  }

  /**
   * Handles zoom window close by ensuring focus is properly managed
   */
  const handleZoomClose = React.useCallback((event) => {
    event.preventDefault()
    mathRef.current?.focus()
  }, [])

  /**
   * Dispatches the target selection when the user clicks on the MATH entity.
   * Problem is the MATH entity is an SVG instead of text, it's not recommended.
   * For more info on the problem see:
   * https://draftjs.org/docs/advanced-topics-block-components/
   */
  async function handleClick (event) {
    // Only proceed if we have a valid lock and are in edit mode
    if (!hasValidLock || !editInProgress || isSelecting) {
      return
    }

    try {
      setIsSelecting(true)
      
      event.stopPropagation()
      event.preventDefault()
      
      const blockKey = offsetKey.split('-')[0]
      const block = contentState.getBlockForKey(blockKey)
      
      const selectionPromise = new Promise(resolve => {
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
          resolve(selection)
        })
      })

      const selection = await selectionPromise
      await applySelection(cardId, selection)

    } catch (err) {
      console.error('Error selecting math entity:', err)
    } finally {
      setIsSelecting(false)
    }
  }

  function handleKeyDown(event) {
    if (editInProgress) return
    
    // Handle Enter or Space key
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      // Trigger MathJax zoom programmatically
      const mjxContainer = mathRef.current?.querySelector('mjx-container')
      if (mjxContainer) {
        mjxContainer.dispatchEvent(new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        }))
      }
    }
  }

  // To select the MATH entity, click right before or after the equation.
  return (
    <MathWrapper 
      ref={mathRef}
      editing={editInProgress} 
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
    >
        <MathJaxWrapper
          ref={texRef}
          latex={decoratedText}
          display="inline"
          style={{}}
          onSuccess={() => setError(null)}
          onError={setError}
          onZoomClose={handleZoomClose}
          options={{
            enableMenu: !editInProgress,
            settings: {
              zoom: editInProgress ? 'None' : 'Click'
            }
          }}
        />
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
  position: relative;
  display: inline-block;
  
  appearance: none;
  -webkit-appearance: none;
  
  vertical-align: middle;
  font-size: 0.8em;
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

  /* Style the MathJax container to not interfere with clicks */
  & .MJX-TEX {
    pointer-events: ${props => props.editing ? 'none' : 'auto'};
  }

  & mjx-container {
    position: relative;
    z-index: 0;
    pointer-events: ${props => props.editing ? 'none' : 'auto'};
  }
`
