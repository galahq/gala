/**
 * @providesModule NoSearchResults
 * @flow
 */

import * as React from 'react'
import { NonIdealState } from '@blueprintjs/core'
import { injectIntl, FormattedMessage } from 'react-intl'

const NoSearchResults = injectIntl(({ intl }) => (
  <NonIdealState
    className="bp4-dark"
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
          className="bp4-button bp4-intent-primary bp4-icon-annotation"
          href="https://docs.learngala.com/docs/"
        >
          <FormattedMessage id="catalog.createACase" />
        </a>
      </div>
    }
  />
))

export default NoSearchResults
