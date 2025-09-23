/**
 * @providesModule Libraries
 * @flow
 */

import React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import { CatalogDataContext } from 'catalog/catalogData'
import { CatalogSection, SectionTitle } from 'catalog/shared'

const Libraries = () => {
  const [{ libraries }] = React.useContext(CatalogDataContext)

  if (libraries.length < 3) return null

  return (
    <CatalogSection solid>
      <SectionTitle>
        <LibrariesLink href="/libraries">
          <FormattedMessage id="libraries.index.libraries" />
        </LibrariesLink>
      </SectionTitle>

      <Grid>
        {libraries.map(l => (
          <Library key={l.slug} library={l} />
        ))}
      </Grid>
    </CatalogSection>
  )
}

export default Libraries

const LibrariesLink = styled.a`
  color: #ebeae4;

  &::after {
    content: ' ›';
  }

  &:hover {
    color: #ebeae4;
    text-decoration: underline;
  }
`

const Grid = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
`

const Library = ({ library }) => (
  <LibraryLink to={library.links.self}>
    <img alt="" src={library.mediumLogoUrl} />
    {library.name}
  </LibraryLink>
)

const LibraryLink = styled(Link)`
  align-items: center;
  background-color: #1c3f5d;
  border-radius: 2px;
  color: #ebeae4;
  display: flex;
  line-height: 1.2;

  &:hover {
    color: #ebeae4;
    text-decoration: underline;
  }

  img {
    height: 31px;
    margin: 1em;
  }
`
