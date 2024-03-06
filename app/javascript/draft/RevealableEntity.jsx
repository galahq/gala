/**
 * @providesModule RevealableEntity
 * @flow
 */

import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import type { State } from 'redux/state'

function mapStateToProps (state: State) {
  return {
    editInProgress: state.edit.inProgress,
  }
}

function RevealableComponent (props) {
  const { editInProgress, children } = props
  const [reveal, setReveal] = useState(false)

  useEffect(() => {
    setReveal(editInProgress)
  }, [editInProgress])

  function onClick () {
    if (editInProgress) {
      return true
    }
    setReveal(!reveal)
  }

  function onKeyDown (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }

  return (
    // eslint-disable-next-line
    <a role="button"
       tabIndex="0"
       aria-label="Reveal the answer"
       className={`pt-button pt-minimal c-revealable-entity${reveal ? '--reveal' : ''}`}
       onClick={onClick}
       onKeyDown={onKeyDown}
    >
      {children.map((child, index) =>
        <span key={index} aria-hidden={!reveal}>
          {React.cloneElement(child, { forceSelection: true })}
        </span>
      )}
    </a>
  )
}

// $FlowFixMe
const RevealableEntity = connect(
  mapStateToProps
)(RevealableComponent)

export default RevealableEntity
