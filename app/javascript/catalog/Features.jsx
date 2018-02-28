/**
 * @providesModule Features
 * @flow
 */

import React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'

import { CatalogSection, SectionTitle } from 'catalog/shared'

import type { Case } from 'redux/state'

type Props = { featuredCases: Case[], readerIsEditor: boolean }
const Featured = ({ featuredCases, readerIsEditor }: Props) => (
  <CatalogSection solid>
    <SectionTitle>
      <FormattedMessage id="features.index.featuredCases" />
    </SectionTitle>
    <Grid>
      {featuredCases.map(
        (
          { slug, kicker, title, dek, coverUrl, photoCredit, url, publishedAt },
          i
        ) => (
          <CaseBlock
            key={slug}
            published={!!publishedAt}
            kicker={kicker}
            title={title}
            dek={i < 2 && dek}
            coverUrl={coverUrl}
            photoCredit={photoCredit}
            url={publishedAt || readerIsEditor ? url : undefined}
          />
        )
      )}
    </Grid>
  </CatalogSection>
)

export default Featured

const Grid = styled.ul`
  margin: 0;
  padding: 0;
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 300px minmax(230px, 1fr);

  @media (max-width: 1150px) {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 200px) repeat(2, minmax(150px, 1fr));
  }

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
    grid-template-rows:
      repeat(2, minmax(250px, 2fr))
      repeat(4, minmax(150px, 1fr));
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
}) => (
  <Box>
    <Background image={coverUrl} href={url}>
      {published || <Forthcoming />}
      <Title>
        <Kicker>{kicker}</Kicker>
        {title}
      </Title>
      {dek && <Dek>{dek}</Dek>}
      <PhotoCredit>{photoCredit}</PhotoCredit>
    </Background>
  </Box>
)

const Title = styled.h3`
  font-family: 'adelle';
  font-size: 1.3em;
  line-height: 1.1;
  color: #ebeae4;
  margin: 0;
`
const Kicker = styled.span`
  display: block;
  font-family: ${p => p.theme.sansFont};
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.6em;
`
const Dek = styled.p`
  font-weight: 500;
  margin: 0.5em 0 0 0;
  font-size: 1em;
  line-height: 110%;
`
const Box = styled.li`
  display: block;
  &:nth-child(-n + 2) {
    @media (min-width: 800px) {
      grid-column-end: span 2;
    }

    ${Title} {
      font-size: 1.5em;
    }
  }
`
const Background = styled.a`
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5)),
    url(${({ image }) => image});
  background-size: cover;
  background-position: center;
  height: 100%;
  padding: 1.7em 1.5em;
  border-radius: 2px;
  position: relative;
  font-family: ${p => p.theme.sansFont};
  color: #ebeae4;
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
  transition: box-shadow 0.15s cubic-bezier(0.33, 0.66, 0.66, 1),
    transform 0.15s cubic-bezier(0.33, 0.66, 0.66, 1);
  cursor: default !important;

  &[href]:hover {
    color: #ebeae4 !important;
    cursor: pointer !important;
    transform: scale(1.01);
    box-shadow: 0 10px 6px -6px rgba(0, 0, 0, 0.4);
    outline: none;
  }
  &[href]:focus {
    outline-color: rgba(214, 199, 255, 0.5);
  }
`
const PhotoCredit = styled.cite.attrs({ 'aria-hidden': true })`
  text-transform: uppercase;
  letter-spacing: 0.25px;
  color: rgba(235, 234, 228, 0.5);
  font: normal 500 10px ${p => p.theme.sansFont};
  max-width: 18em;
  position: absolute;
  bottom: 0.5rem;
  right: 0.75rem;
  margin: 0;
`

const ForthcomingBanner = styled.div`
  color: #262626;
  position: absolute;
  top: 1em;
  right: 0;
  padding: 0.2rem 0.5rem 0.15rem 0.4rem;
  font-size: 80%;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.6px;
  background-color: #6acb72;
  border-left: 0.35rem solid #357e3c;
`
const Forthcoming = () => <ForthcomingBanner>Forthcoming</ForthcomingBanner>
