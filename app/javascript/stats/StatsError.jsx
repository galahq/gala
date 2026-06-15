/** @jsx React.createElement */
/*  */

import React from 'react'
import { NonIdealState } from '@blueprintjs/core'
import { FormattedMessage } from 'react-intl'


export function StatsErrorState ({ error, onRetry, isRetrying = false }) {
  const errorTitle = <FormattedMessage id="cases.stats.show.errorTitle" />
  const errorDescription = error?.message || (
    <FormattedMessage id="cases.stats.show.errorDescription" />
  )

  const errorAction = (
    <button
      className="pt-button pt-intent-primary"
      disabled={isRetrying}
      onClick={onRetry}
    >
      {isRetrying ? 'Loading...' : <FormattedMessage id="cases.stats.show.errorTryAgain" />}
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
