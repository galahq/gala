/** @jsx React.createElement */
/* @flow */

import React from 'react'
import { NonIdealState } from '@blueprintjs/core'

type Props = {
  error: ?Error,
  onRetry: () => void,
  isRetrying?: boolean,
}

export function StatsErrorState ({ error, onRetry, isRetrying = false }: Props): React$Node {
  const errorTitle = 'Unable to Load Stats'
  const errorDescription =
    error?.message ||
    'An error occurred while loading the statistics data. Please try again.'

  const errorAction = (
    <button
      className="pt-button pt-intent-primary"
      disabled={isRetrying}
      onClick={onRetry}
    >
      {isRetrying ? 'Loading...' : 'Try Again'}
    </button>
  )

  return (
    <div className="c-stats-centered">
      <NonIdealState
        title={errorTitle}
        description={errorDescription}
        visual="error"
        action={errorAction}
      />
    </div>
  )
}

export default StatsErrorState
