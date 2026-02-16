/** @jsx React.createElement */
/* @flow */

import React from 'react'
import { NonIdealState } from '@blueprintjs/core'
import { FormattedMessage } from 'react-intl'

type Props = {
  error: ?Error,
  onRetry: () => void,
  isRetrying?: boolean,
}

export function StatsErrorState ({ error, onRetry, isRetrying = false }: Props): React$Node {
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
