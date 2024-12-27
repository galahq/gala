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

  const conditionalProps = {}
  if (!editInProgress) {
    conditionalProps.tabIndex = 0
  }

  return (
    // eslint-disable-next-line
    <a role="button"
       className={`pt-button pt-minimal c-revealable-entity${reveal ? '--reveal' : ''}`}
       aria-label={"This text is hidden, click to reveal"}
       onClick={onClick}
       onKeyDown={onKeyDown}
       {...conditionalProps}
    >
      <span aria-live="assertive" aria-hidden={!reveal}>{children.map((child, index) =>
        <span key={index} >
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
