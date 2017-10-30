/**
 * @providesModule Results
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import qs from 'qs'

import { Orchard } from 'shared/orchard'

import { Route } from 'react-router-dom'

import CaseList from 'catalog/CaseList'
import LibraryInfo from 'catalog/LibraryInfo'
import { Main, CatalogSection, SectionTitle } from 'catalog/shared'

import type { ContextRouter } from 'react-router-dom'
import type { State } from 'catalog'

type Query = { [string]: string | string[] }

type Props = { ...ContextRouter, ...State, readerIsEditor: boolean }
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
    const { loading, cases, readerIsEditor } = this.props
    return [
      <Sidebar key="sidebar">
        <Route
          path="/catalog/libraries/:slug"
          render={({ match }) => <LibraryInfo slug={match.params.slug || ''} />}
        />
      </Sidebar>,
      <Main key="main">
        <CatalogSection>
          <SectionTitle>Search Results</SectionTitle>
          {loading.cases ? null : (
            <CaseList
              cases={this.state.results.map(slug => cases[slug])}
              readerIsEditor={readerIsEditor}
            />
          )}
        </CatalogSection>
      </Main>,
    ]
  }

  _fetchResults = () => {
    Orchard.harvest(
      `search`,
      this._getQueryParams()
    ).then((results: string[]) => this.setState({ loading: false, results }))
  }

  _getQueryParams = (): Query => {
    const { pathname, search } = this.props.location
    return {
      ...qs.parse(search, { ignoreQueryPrefix: true }),
      ...getQueryFromPathname(pathname),
    }
  }
}
export default Results

function getQueryFromPathname (pathname: string): { [string]: string } {
  return ['libraries', 'tags'].reduce((params, key) => {
    const match = pathname.match(RegExp(`${key}/([0-9a-z%+-]+)`))
    if (!match) return params
    params[key] = match[1]
    return params
  }, {})
}

const Sidebar = styled.aside`
  width: 18em;
  margin: 0 0.5em 2em;
`
