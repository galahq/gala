/**
 * @providesModule Categories
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'

import { CatalogSection, SectionTitle } from 'catalog/shared'

const Categories = () => (
  <>
    <Section title="naturalResources">
      <NaturalResourcesGrid>
        <NaturalResourceLink category="water" />
        <NaturalResourceLink category="materials" />
        <NaturalResourceLink category="energy" />
        <NaturalResourceLink category="land" />
        <NaturalResourceLink category="lifeforms" />
      </NaturalResourcesGrid>
    </Section>
    <Section title="globalSystems">
      <GlobalSystemsGrid>
        <GlobalSystemLink category="food" />
        <GlobalSystemLink category="climate" />
        <GlobalSystemLink category="health" />
      </GlobalSystemsGrid>
    </Section>
  </>
)
export default Categories

const Section = ({ children, title }) => (
  <CatalogSection solid>
    <SectionTitle>
      <FormattedMessage id={`catalog.${title}`} />
    </SectionTitle>
    {children}
  </CatalogSection>
)

const NaturalResourcesGrid = styled.div`
  display: flex;
  overflow-x: auto;

  & > * {
    flex: 1;
    min-width: 130px;

    &:not(:last-child) {
      margin-right: 1em;
    }
  }

  @media (max-width: 800px) {
    flex-direction: column;

    & > * {
      height: 100px;
      overflow: hidden;

      img {
        max-height: 100px;
        object-fit: cover;
        object-position: 0 60%;
      }
    }

    & > *:not(:last-child) {
      margin-right: 0;
      margin-bottom: 1em;
    }
  }
`

const GlobalSystemsGrid = styled.div`
  display: flex;
  overflow-x: auto;

  & > * {
    flex: 1;
    min-width: 230px;

    &:not(:last-child) {
      margin-right: 1em;
    }
  }

  @media (max-width: 800px) {
    flex-direction: column;

    & > *:not(:last-child) {
      margin-right: 0;
      margin-bottom: 1em;
    }
  }
`

const NaturalResourceLink = ({ category }) => (
  <Link category={category} labelComponent={NaturalResourceLabel} />
)

const GlobalSystemLink = ({ category }) => (
  <Link category={category} labelComponent={GlobalSystemLabel} />
)

type LinkParams = {
  category: string,
  labelComponent: React.ComponentType<*>,
}

const Link = ({ category, labelComponent: Label }: LinkParams) => (
  <LinkContainer>
    <img alt="" src={require(`images/category-${category}.png`)} />
    <Label>
      <FormattedMessage id={`catalog.categories.${category}`} />
    </Label>
  </LinkContainer>
)

const LinkContainer = styled.div`
  border-radius: 4pt;
  position: relative;

  img {
    width: 100%;
    height: auto;
  }
`

const NaturalResourceLabel = styled.span`
  bottom: 20%;
  color: #EBEAE4;
  font-family: freight-text-pro, ${p => p.theme.sansFont};
  font-style: italic;
  font-size: 24px;
  font-weight: 700;
  left: 50%;
  position: absolute;
  text-shadow: 0 0 6px rgba(0,0,0,0.50);
  transform: translateX(-50%);

  @media (max-width: 800px) {
    top: 55px;
    transform: translate(-50%, -50%);
  }
`

const GlobalSystemLabel = styled.span`
  color: #EBEAE4;
  font-size: 28px;
  font-weight: 700;
  left: 50%;
  letter-spacing: 1.15px;
  position: absolute;
  text-shadow: 0 0 6px rgba(0,0,0,0.50);
  text-transform: uppercase;
  top: 50%;
  transform: translate(-50%, -50%);
`
