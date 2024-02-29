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

  return (
    <a className={`c-revealable-entity${reveal ? '--reveal' : ''}`}
       onClick={onClick}
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
