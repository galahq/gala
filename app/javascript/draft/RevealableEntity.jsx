/**
 * @providesModule RevealableEntity
 * @flow
 */

import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import type { State } from 'redux/state'

function mapStateToProps (
  state: State,
  { decoratedText, offsetKey, contentState, entityKey, children }
) {
  return {
    editInProgress: state.edit.inProgress,
  }
}

function RevealableSpan (props) {
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
    console.log({ event })
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
       aria-label="Reveal the answer"
       className={`c-revealable-entity${reveal ? '--reveal' : ''} ${editInProgress ? 'editing' : ''}`}
       onClick={onClick}
       onKeyDown={onKeyDown}
       {...conditionalProps}
    >
      {children.map(child =>
        React.cloneElement(child, { forceSelection: true, ariaHidden: !reveal })
      )}
    </a>
  )
}

// $FlowFixMe
const RevealableEntity = connect(
  mapStateToProps
)(RevealableSpan)

export default RevealableEntity
