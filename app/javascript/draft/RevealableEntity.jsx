/**
 * @providesModule RevealableEntity
 * @flow
 */

import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import type { State } from 'redux/state'
import { Icon } from '@blueprintjs/core'

function mapStateToProps(state: State) {
  return {
    editInProgress: state.edit.inProgress,
  }
}

function RevealableComponent(props) {
  const { editInProgress, children } = props
  const [reveal, setReveal] = useState(false)

  useEffect(() => {
    setReveal(editInProgress)
  }, [editInProgress])

  function onClick() {
    if (editInProgress) {
      return true
    }
    setReveal(!reveal)
  }

  function onKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }

  const conditionalProps = {}
  if (!editInProgress) {
    conditionalProps.tabIndex = 0
  }

  return (
    // eslint-disable-next-line
    <a role="button"
      title="Click to reveal"
      className={`c-revealable-entity${reveal ? '--reveal' : ''}`}
      aria-label={"This text is hidden, click to reveal"}
      onClick={onClick}
      onKeyDown={onKeyDown}
      {...conditionalProps}
    >
      <span className="mask" aria-live="assertive" aria-hidden={!reveal}>
        <Icon style={{
          color: '#6ACB72',
          position: 'absolute',
          transform: 'translate(4px, 4px)',
          visibility: reveal ? 'hidden' : 'visible',
        }}
          icon="caret-down" iconSize={14} />
        {children.map((child, index) =>
          <span key={index}>
            {React.cloneElement(child, { forceSelection: true })}
          </span>
        )}</span>
    </a>
  )
}

// $FlowFixMe
const RevealableEntity = connect(
  mapStateToProps
)(RevealableComponent)

export default RevealableEntity

