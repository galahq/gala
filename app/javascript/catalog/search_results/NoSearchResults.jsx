/**
 * @providesModule NoSearchResults
 * @flow
 */

import * as React from 'react'
import { NonIdealState } from '@blueprintjs/core'
import { injectIntl, FormattedMessage } from 'react-intl'

const NoSearchResults = injectIntl(({ intl }) => (
  <NonIdealState
    className="pt-dark"
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
          className="pt-button pt-intent-primary pt-icon-annotation"
          href="https://docs.learngala.com/docs/authoring-getting-started.html"
        >
          <FormattedMessage id="catalog.createACase" />
        </a>
      </div>
    }
  />
))

export default NoSearchResults
