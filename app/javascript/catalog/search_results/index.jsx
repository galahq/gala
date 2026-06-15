/**
 * @providesModule SearchResults
 *
 */

import * as React from 'react'

import { Route } from 'react-router-dom'
import { injectIntl, FormattedMessage } from 'react-intl'

import { CatalogDataContext } from 'catalog/catalogData'
import { ReaderDataContext } from 'catalog/readerData'
import CaseList from 'catalog/search_results/CaseList'
import LibraryInfo from 'catalog/search_results/LibraryInfo'
import SearchForm from 'catalog/search_results/SearchForm'
import NoSearchResults from 'catalog/search_results/NoSearchResults'
import { Main, CatalogSection, SectionTitle } from 'catalog/shared'
import { Container as Sidebar } from 'catalog/home/Sidebar'

import getQueryParams from 'catalog/search_results/getQueryParams'
import useSearchResults from 'catalog/search_results/useSearchResults'
import { useDocumentTitle } from 'utility/hooks'


function SearchResults ({ intl, location }) {
  const [{ cases, loading: casesLoading }] = React.useContext(
    CatalogDataContext
  )
  const {
    roles: { editor },
  } = React.useContext(ReaderDataContext)

  // useDocumentTitle(`${intl.formatMessage({ id: 'search.results' })} — Gala`)
  useDocumentTitle('Gala');

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

          {casesLoading || resultsLoading ? null : caseSlugs.length === 0 ? (
            <NoSearchResults />
          ) : (
            <CaseList cases={results} readerIsEditor={editor} />
          )}
        </CatalogSection>
      </Main>
    </>
  )
}
export default injectIntl(SearchResults)
