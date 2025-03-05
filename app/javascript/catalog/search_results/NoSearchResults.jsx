/**
 * @providesModule NoSearchResults
 * @flow
 */

import * as React from 'react'
import { NonIdealState } from '@blueprintjs/core'
import { injectIntl, FormattedMessage } from 'react-intl'

const NoSearchResults = injectIntl(({ intl }) => (
  <NonIdealState
    className="bp3-dark"
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
    visual="search"
    action={
      <div style={{ textAlign: 'center' }}>
        <p>
          <FormattedMessage id="search.authorACase" />
        </p>
        <a
          className="bp3-button bp3-intent-primary bp3-icon-annotation"
          href="https://docs.learngala.com/docs/"
        >
          <FormattedMessage id="catalog.createACase" />
        </a>
      </div>
    }
  />
))

export default NoSearchResults
