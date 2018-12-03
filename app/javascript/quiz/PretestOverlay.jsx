/**
 * @providesModule PretestOverlay
 * @flow
 */

import * as React from 'react'
import { FormattedMessage } from 'react-intl'

import Overlay from 'shared/Overlay'
import { useRouter } from 'utility/hooks'

function PretestOverlay () {
  const { history } = useRouter()

  return (
    <Overlay theme="LIGHT">
      <div className="pt-callout pt-intent-primary pt-icon-properties">
        <h5 className="pt-callout-title">
          <FormattedMessage id="submissions.new.beforeYouGetStarted" />
        </h5>

        <p>
          <FormattedMessage id="submissions.new.aFewQuestions" />
        </p>

        <button
          className="pt-button pt-intent-primary"
          onClick={() => history.push('/1')}
        >
          <FormattedMessage id="submissions.new.takePreQuiz" />
        </button>
      </div>
    </Overlay>
  )
}

export default PretestOverlay
