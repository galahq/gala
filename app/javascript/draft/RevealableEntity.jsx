/**
 * @providesModule RevealableEntity
 * @flow
 */

import React, { useEffect, useState, memo } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Icon } from '@blueprintjs/core'

const mapStateToProps = state => ({
  editInProgress: state.edit.inProgress,
})

const RevealableComponent = memo(({ editInProgress, children }) => {
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    setIsRevealed(editInProgress)
  }, [editInProgress])

  const handleClick = e => {
    if (editInProgress) {
      return
    }
    
    e.preventDefault()
    setIsRevealed(!isRevealed)
  }

  const handleKeyDown = e => {
    if (editInProgress) {
      return
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick(e)
    }
  }

  const interactiveProps = editInProgress ? {} : {
    role: "button",
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    tabIndex: 0
  }

  return (
    <div 
      {...interactiveProps}
      className={`revealable-entity ${isRevealed ? 'revealable-entity--revealed' : ''} ${editInProgress ? 'revealable-entity--editing' : ''}`}
      aria-expanded={isRevealed}
    >
      {/* Hidden text for screen readers when content is not revealed */}
      {!isRevealed && !editInProgress && (
        <span className="sr-only">
          This text is hidden, press Enter or Space to reveal
        </span>
      )}

      <span 
        className="revealable-entity__content"
        aria-hidden={!isRevealed && !editInProgress}
      >
        {!isRevealed && !editInProgress && (
          <Icon
            icon="caret-down"
            className="revealable-entity__icon"
            aria-hidden="true"
          />
        )}
        {React.Children.map(children, (child, index) => (
          <span key={index}>
            {React.cloneElement(child, { forceSelection: true })}
          </span>
        ))}
      </span>
    </div>
  )
})

RevealableComponent.propTypes = {
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
  editInProgress: PropTypes.bool.isRequired,
}

RevealableComponent.displayName = 'RevealableComponent'

export default connect(mapStateToProps)(RevealableComponent)