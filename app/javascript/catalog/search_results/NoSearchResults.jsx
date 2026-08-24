/**
 * @providesModule NoSearchResults
 */

import * as React from 'react'
import { NonIdealState } from '@blueprintjs/core'
import { injectIntl, FormattedMessage } from 'react-intl'

const NoSearchResults = injectIntl(({ intl }) => (
  <NonIdealState
    className="bp6-dark"
    title={intl.formatMessage({
      id: 'search.noResults',
    })}
    description={
      <span>
        <FormattedMessage id="search.didntMatch" />
        <br />
        <FormattedMessage id="search.tryAgain" />
      </span>
    }
    icon="search"
    action={
      <div style={{ textAlign: 'center' }}>
        <p>
          <FormattedMessage id="search.authorACase" />
        </p>
        <a
          className="bp6-button bp6-intent-primary bp6-icon-annotation"
          href="https://docs.learngala.com/docs/"
        >
          <FormattedMessage id="catalog.createACase" />
        </a>
      </div>
    }
  />
))

export default NoSearchResults
