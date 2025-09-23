/**
 * @providesModule SearchForm
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import qs from 'qs'
import { reject, isEmpty } from 'ramda'

import { withRouter } from 'react-router-dom'
import { injectIntl, FormattedMessage } from 'react-intl'

import { Button, FormGroup, InputGroup, Intent } from '@blueprintjs/core'
import { CatalogSection, SectionTitle } from 'catalog/shared'
import KeywordsChooser from 'overview/keywords/KeywordsChooser'
import LanguageChooser from './LanguageChooser'
import LibraryChooser from './LibraryChooser'


function SearchForm ({ history, intl, params, location }) {
  const queryFromUrl = (params.q || []).join(' ')
  const [query, setQuery] = React.useState(queryFromUrl)
  React.useEffect(() => setQuery(queryFromUrl), [params.query])

  const [tagObjects, setTagObjects] = React.useState(
    createTagObjects(params.tags)
  )

  const [languageObjects, setLanguageObjects] = React.useState(
    createLanguageObjects(params.languages)
  )

  const [libraryObjects, setLibraryObjects] = React.useState(
    createLibraryObjects(params.libraries)
  )

  // Check if we're on a library-specific page
  const isLibraryPage = location.pathname.includes('/catalog/libraries/')

  function handleSubmit (e) {
    e.preventDefault()
    const searchParams = {
      q: query,
      tags: tagObjects.map(tag => tag.name),
      languages: languageObjects.map(lang => lang.code),
    }
    
    // Only include libraries if we're not on a library page
    if (!isLibraryPage) {
      searchParams.libraries = libraryObjects.map(lib => lib.slug)
    }
    
    const searchPath = getSearchPath(searchParams)
    history.push(searchPath)
  }

  return (
    <CatalogSection className="pt-dark">
      <SectionTitle>
        <FormattedMessage id="search.refine" />
      </SectionTitle>

      <form onSubmit={handleSubmit}>
        <FormGroup>
          <InputGroup
            className="pt-fill"
            leftIcon="search"
            placeholder={intl.formatMessage({
              id: 'search.fullTextSearch',
            })}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </FormGroup>

        <FormGroup label={<FormattedMessage id="catalog.keywords" />}>
          <KeywordsChooser tags={tagObjects} onChange={setTagObjects} />
        </FormGroup>

        <FormGroup label={<FormattedMessage id="catalog.languages.Languages" />}>
          <LanguageChooser languages={languageObjects} onChange={setLanguageObjects} />
        </FormGroup>

        {!isLibraryPage && (
          <FormGroup label={<FormattedMessage id="catalog.libraries.Libraries" />}>
            <LibraryChooser libraries={libraryObjects} onChange={setLibraryObjects} />
          </FormGroup>
        )}

        <SubmitButton>
          <FormattedMessage id="search.search" />
        </SubmitButton>
      </form>
    </CatalogSection>
  )
}

export default injectIntl(withRouter(SearchForm))

function createTagObjects (names) {
  return names ? names.map(name => ({ name, displayName: name })) : []
}

function createLanguageObjects (codes) {
  return codes ? codes.map(code => ({ code, name: code })) : []
}

function createLibraryObjects (slugs) {
  return slugs ? slugs.map(slug => ({ slug, name: slug })) : []
}

export function getSearchPath (params) {
  return `/catalog/search?${qs.stringify(reject(isEmpty, params), {
    arrayFormat: 'brackets',
    encodeValuesOnly: true,
    encoder: value => encodeURIComponent(value).replace(/%20/g, '+'),
    skipNulls: true,
  })}`
}

const SubmitButton = styled(Button).attrs({
  type: 'submit',
  intent: Intent.SUCCESS,
})`
  margin-top: 12px;
`
