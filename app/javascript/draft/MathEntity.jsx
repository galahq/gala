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
    cardId
  } = props

  const [error, setError] = useState(null)
  const mathRef = useRef(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const texRef = useRef(null)

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
        const selection = new SelectionState({
          anchorKey: blockKey,
          anchorOffset: entityRange.start,
          focusKey: blockKey,
          focusOffset: entityRange.end
        })

        applySelection(cardId, selection)
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
  
  ${({ editing }) => editing ? `
    cursor: text;
    }
  ` : `
    cursor: zoom-in;
    }
  `}

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
