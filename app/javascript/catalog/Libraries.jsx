/**
 * @providesModule Libraries
 * @flow
 */

import React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { CatalogSection, SectionTitle } from 'catalog/shared'

import type { Library as LibraryT } from 'redux/state'

type Props = { libraries: LibraryT[] }
const Libraries = ({ libraries }: Props) => {
  if (libraries.length < 3) return null

  return (
    <CatalogSection solid>
      <SectionTitle>
        <FormattedMessage id="libraries.index.libraries" />
      </SectionTitle>

      <Grid>{libraries.map(l => <Library key={l.slug} library={l} />)}</Grid>
    </CatalogSection>
  )
}

export default Libraries

const Grid = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
`

const Library = ({ library }) => (
  <Link href={library.links.self}>
    <img alt="" src={library.logoUrl} />
    {library.name}
  </Link>
)

const Link = styled.a`
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
