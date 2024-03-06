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

  // TODO see if this is doing what i think its doing
  const srProps = {
    ariaHidden: !reveal,
  }

  return (
    // eslint-disable-next-line
    <a role="button"
       tabIndex="0"
       aria-label="Reveal the answer"
       {...srProps}
       className={`pt-button pt-minimal c-revealable-entity${reveal ? '--reveal' : ''}`}
       onClick={onClick}
       onKeyDown={(event) => {
        // Trigger the onClick event when Enter or Space is pressed
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
    >
      {children.map(child =>
        React.cloneElement(child, { forceSelection: true })
      )}
    </a>
  )
}

// $FlowFixMe
const RevealableEntity = connect(
  mapStateToProps
)(RevealableSpan)

export default RevealableEntity
