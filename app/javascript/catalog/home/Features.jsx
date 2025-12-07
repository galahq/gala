/**
 * @providesModule Features
 * @flow
 */

import React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'

import { CatalogDataContext } from 'catalog/catalogData'
import { CatalogSection, SectionTitle } from 'catalog/shared'
import { FeaturesCell as Cell } from 'catalog/home/shared'
import TitleCard from 'shared/TitleCard'

type Props = { selecting: boolean }

function Featured ({ selecting }: Props) {
  const [{ cases: allCases, enrollments, features }] = React.useContext(
    CatalogDataContext
  )

  let slugs = features
  if (selecting) {
    const enrolledSlugs = enrollments.map(e => e.caseSlug)
    slugs = [...enrolledSlugs, ...slugs]
  }

  const cases = six(slugs).map(slug => allCases[slug])

  return (
    <CatalogSection solid>
      <SectionTitle>
        <FormattedMessage id="features.index.featuredCases" />
      </SectionTitle>

      <Grid>
        {cases.map((kase, i) => {
          if (kase == null) return <Cell key={`placeholder-${i}`} />

          const {
            authors,
            coverUrl,
            kicker,
            links,
            photoCredit,
            slug,
            title,
          } = kase

          return (
            <CaseBlock
              authors={authors}
              coverUrl={coverUrl}
              key={slug}
              kicker={kicker}
              photoCredit={photoCredit}
              title={title}
              url={links.self}
            />
          )
        })}
      </Grid>
    </CatalogSection>
  )
}

export default Featured

function six (arr) {
  const paddedArr = arr.length < 6 ? [...arr, ...Array(6)] : arr
  return paddedArr.slice(0, 6)
}

export const Grid = styled.ul`
  margin: 0;
  padding: 0;
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: minmax(300px, 1fr) auto;

  @media (max-width: 1150px) {
    grid-template-columns: repeat(2, auto);
    grid-template-rows: repeat(2, minmax(200px, 1fr)) repeat(
        2,
        minmax(150px, 1fr)
      );
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: repeat(3, auto);
  }

  @media (max-width: 450px) {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(6, auto);
  }
`

const CaseBlock = ({
  kicker,
  title,
  dek,
  coverUrl,
  photoCredit,
  url,
  published,
  authors,
}) => (
  <Cell>
    <a href={url}>
      <TitleCard
        authors={authors}
        coverUrl={coverUrl}
        kicker={kicker}
        photoCredit={photoCredit}
        title={title}
      />
    </a>
  </Cell>
)
