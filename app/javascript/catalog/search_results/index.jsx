/**
 * @providesModule SearchResults
 * @flow
 */

import * as React from 'react'

import { Route } from 'react-router-dom'
import { injectIntl, FormattedMessage } from 'react-intl'

import CaseList from 'catalog/search_results/CaseList'
import LibraryInfo from 'catalog/search_results/LibraryInfo'
import SearchForm from 'catalog/search_results/SearchForm'
import NoSearchResults from 'catalog/search_results/NoSearchResults'
import { Main, CatalogSection, SectionTitle } from 'catalog/shared'
import { Container as Sidebar } from 'catalog/home/Sidebar'

import getQueryParams from 'catalog/search_results/getQueryParams'
import useSearchResults from 'catalog/search_results/useSearchResults'
import { useDocumentTitle } from 'utility/hooks'

import type { ContextRouter } from 'react-router-dom'
import type { IntlShape } from 'react-intl'
import type { State } from 'catalog'

type Props = {
  ...ContextRouter,
  ...State,
  readerIsEditor: boolean,
  intl: IntlShape,
}
function SearchResults ({
  cases,
  intl,
  loading,
  location,
  readerIsEditor,
}: Props) {
  useDocumentTitle(`${intl.formatMessage({ id: 'search.results' })} — Gala`)

  const [caseSlugs, resultsLoading] = useSearchResults(location)
  const results = caseSlugs.map(slug => cases[slug]).filter(Boolean)

  return (
    <>
      <Sidebar>
        <Route
          path="/catalog/libraries/:slug"
          render={({ match }) => <LibraryInfo slug={match.params.slug || ''} />}
        />
        <SearchForm params={getQueryParams(location)} />
      </Sidebar>

      <Main>
        <CatalogSection>
          <SectionTitle>
            <FormattedMessage id="search.results" />
          </SectionTitle>

          {loading.cases || resultsLoading ? null : caseSlugs.length === 0 ? (
            <NoSearchResults />
          ) : (
            <CaseList cases={results} readerIsEditor={readerIsEditor} />
          )}
        </CatalogSection>
      </Main>
    </>
  )
}
export default injectIntl(SearchResults)
