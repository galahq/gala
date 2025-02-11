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
    e.preventDefault()
    if (!editInProgress) {
      setIsRevealed(!isRevealed)
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick(e)
    }
  }

  return (
    <div 
      role="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`revealable-entity ${isRevealed ? 'revealable-entity--revealed' : ''}`}
      aria-expanded={isRevealed}
      tabIndex={editInProgress ? -1 : 0}
    >
      {/* Hidden text for screen readers when content is not revealed */}
      {!isRevealed && (
        <span className="sr-only">
          This text is hidden, press Enter or Space to reveal
        </span>
      )}

      <span 
        className="revealable-entity__content"
        aria-hidden={!isRevealed}
      >
        {!isRevealed && (
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