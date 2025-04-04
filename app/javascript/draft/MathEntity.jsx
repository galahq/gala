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
  return {
    cardId,
    editInProgress: state.edit.inProgress,
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
    cardId,
    editorState
  } = props

  const [error, setError] = useState(null)
  const mathRef = useRef(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const texRef = useRef(null)

  const isSelected = React.useMemo(() => {
    const selection = editorState.getSelection()
    if (!selection.getHasFocus()) return false
    
    const blockKey = offsetKey.split('-')[0]
    const block = contentState.getBlockForKey(blockKey)
    
    let entityIsSelected = false
    block.findEntityRanges(
      character => character.getEntity() === entityKey,
      (start, end) => {
        entityIsSelected = selection.getStartOffset() <= end && 
                         selection.getEndOffset() >= start &&
                         selection.getAnchorKey() === blockKey
      }
    )
    return entityIsSelected
  }, [editorState, contentState, entityKey, offsetKey])

  if (error) {
    return null
  }

  const handleZoomClose = React.useCallback((event) => {
    event.preventDefault()
    mathRef.current?.focus()
  }, [])

  function handleClick (event) {
    if (!editInProgress || isSelecting) {
      return
    }

    try {
      setIsSelecting(true)
      
      event.stopPropagation()
      event.preventDefault()
      
      const blockKey = offsetKey.split('-')[0]
      const block = contentState.getBlockForKey(blockKey)
      
      // Find entity range
      let entityRange = null
      block.findEntityRanges(
        character => character.getEntity() === entityKey,
        (start, end) => {
          entityRange = { start, end }
        }
      )

      if (entityRange) {
        // Create and verify selection before applying
        const selection = SelectionState.createEmpty(blockKey).merge({
          anchorOffset: entityRange.start,
          focusOffset: entityRange.end,
          hasFocus: true,
          isBackward: false
        })

        // Only apply if we have a valid selection
        if (selection.getAnchorKey() === blockKey && 
            selection.getFocusKey() === blockKey) {
          // Create a new range for the DOM selection
          const range = document.createRange()
          const element = mathRef.current
          
          if (element) {
            range.selectNodeContents(element)
            const domSelection = window.getSelection()
            domSelection.removeAllRanges()
            domSelection.addRange(range)
          }
          
          applySelection(cardId, selection)
        }
      }

    } catch (err) {
      console.error('Error selecting math entity:', err)
    } finally {
      setIsSelecting(false)
    }
  }

  function handleKeyDown(event) {
    if (editInProgress) return
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
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

  return (
    <MathWrapper 
      ref={mathRef}
      editing={editInProgress}
      selected={isSelected}
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
  background-color: rgba(174, 179, 183, .5);
  padding: 8px;
  border-radius: 4px;
  margin: 0;
  overflow-x: auto;
  max-width: 656px;
  min-height: 62px;
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
  
  ${({ editing, selected }) => {
    if (editing) {
      return `
        cursor: text;
        background-color: ${selected ? '#d5d4cc' : '#e5e4dc'};
      `
    }
    return `
      cursor: zoom-in;
      background-color: #e5e4dc;
    `
  }}

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
