/**
 * @providesModule Results
 * @flow
 */

import * as React from 'react'
import qs from 'qs'
import { map } from 'ramda'

import { Orchard } from 'shared/orchard'

import { Route } from 'react-router-dom'
import { NonIdealState } from '@blueprintjs/core'
import { injectIntl, FormattedMessage } from 'react-intl'
import DocumentTitle from 'react-document-title'

import CaseList from 'catalog/CaseList'
import LibraryInfo from 'catalog/LibraryInfo'
import SearchForm from 'catalog/SearchForm'
import { Main, CatalogSection, SectionTitle } from 'catalog/shared'
import { Container as Sidebar } from 'catalog/Sidebar'

import type { ContextRouter } from 'react-router-dom'
import type { IntlShape } from 'react-intl'
import type { State } from 'catalog'

export type Query = { [string]: string[] }

type Props = {
  ...ContextRouter,
  ...State,
  readerIsEditor: boolean,
  intl: IntlShape,
}
class Results extends React.Component<
  Props,
  { loading: boolean, results: string[] }
> {
  constructor (props: Props) {
    super(props)
    this.state = { loading: true, results: [] }
  }

  componentDidMount () {
    this._fetchResults()
  }

  componentDidUpdate (prevProps: Props) {
    if (
      this.props.location.pathname !== prevProps.location.pathname ||
      this.props.location.search !== prevProps.location.search
    ) {
      this.setState({ loading: true })
      this._fetchResults()
    }
  }

  render () {
    const { intl, loading, readerIsEditor } = this.props
    return (
      <DocumentTitle
        title={`${intl.formatMessage({ id: 'search.results' })} — Gala`}
      >
        <>
          <Sidebar>
            <Route
              path="/catalog/libraries/:slug"
              render={({ match }) => (
                <LibraryInfo slug={match.params.slug || ''} />
              )}
            />
            <SearchForm params={this._getQueryParams()} />
          </Sidebar>
          <Main>
            <CatalogSection>
              <SectionTitle>
                <FormattedMessage id="search.results" />
              </SectionTitle>
              {loading.cases || this.state.loading ? null : this._results()
                .length === 0 ? (
                  <NoSearchResults />
                ) : (
                  <CaseList
                    cases={this._results()}
                    readerIsEditor={readerIsEditor}
                  />
                )}
            </CatalogSection>
          </Main>
        </>
      </DocumentTitle>
    )
  }

  _fetchResults = () => {
    Orchard.harvest(`search`, this._getQueryParams()).then(
      (results: string[]) => this.setState({ loading: false, results })
    )
  }

  _getQueryParams = (): Query => {
    const { pathname, search } = this.props.location
    return {
      ...coerceIntoArrayValues(qs.parse(search, { ignoreQueryPrefix: true })),
      ...getQueryFromPathname(pathname),
    }
  }

  _results () {
    return this.state.results
      .map(slug => this.props.cases[slug])
      .filter(Boolean)
  }
}
export default injectIntl(Results)

function coerceIntoArrayValues (params: {
  [string]: string | string[],
}): { [string]: string[] } {
  return map(x => (Array.isArray(x) ? x : [x]), params)
}

function getQueryFromPathname (pathname: string): { [string]: string[] } {
  return ['libraries', 'tags'].reduce((params, key) => {
    const match = pathname.match(RegExp(`${key}/([0-9a-z%+-]+)`))
    if (!match) return params
    params[key] = [match[1]]
    return params
  }, {})
}

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
          <FormattedMessage id="search.proposeACase" />
        </p>
        <a
          className="pt-button pt-intent-primary pt-icon-annotation"
          href="http://www.teachmsc.org/action/make/proposal"
        >
          <FormattedMessage id="catalog.proposeACase" />
        </a>
      </div>
    }
  />
))
