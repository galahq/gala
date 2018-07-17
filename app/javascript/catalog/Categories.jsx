/**
 * @providesModule Categories
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'

import { CatalogSection, SectionTitle } from 'catalog/shared'

import type { Tag } from 'redux/state'

type Props = { tags: Tag[] }
const Categories = ({ tags }: Props) => {
  const get = name => tags.find(t => t.name === name)
  return (
    <>
      <Section title="naturalResources">
        <NaturalResourcesGrid>
          <NaturalResourceLink tag={get('water')} />
          <NaturalResourceLink tag={get('materials')} />
          <NaturalResourceLink tag={get('energy')} />
          <NaturalResourceLink tag={get('land')} />
          <NaturalResourceLink tag={get('lifeforms')} />
        </NaturalResourcesGrid>
      </Section>
      <Section title="globalSystems">
        <GlobalSystemsGrid>
          <GlobalSystemLink tag={get('food')} />
          <GlobalSystemLink tag={get('climate')} />
          <GlobalSystemLink tag={get('health')} />
        </GlobalSystemsGrid>
      </Section>
    </>
  )
}
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

const NaturalResourceLink = ({ tag }) => (
  <Link tag={tag} labelComponent={NaturalResourceLabel} />
)

const GlobalSystemLink = ({ tag }) => (
  <Link tag={tag} labelComponent={GlobalSystemLabel} />
)

type LinkParams = {
  tag: ?Tag,
  labelComponent: React.ComponentType<*>,
}

const Link = ({ tag, labelComponent: Label }: LinkParams) => (
  <LinkContainer href={tag && `/catalog/search?tags[]=${tag.name}`}>
    <img alt="" src={require(`images/category-${tag?.name || 'water'}.png`)} />
    <Label>{tag?.displayName}</Label>
  </LinkContainer>
)

const LinkContainer = styled.a`
  border-radius: 4pt;
  position: relative;

  img {
    width: 100%;
    height: auto;
  }
`

const NaturalResourceLabel = styled.span`
  bottom: 20%;
  color: #ebeae4;
  font-family: freight-text-pro, ${p => p.theme.sansFont};
  font-style: italic;
  font-size: 24px;
  font-weight: 700;
  left: 50%;
  position: absolute;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
  text-transform: capitalize;
  transform: translateX(-50%);

  @media (max-width: 800px) {
    top: 55px;
    transform: translate(-50%, -50%);
  }

  html[lang^='ja'] &,
  html[lang^='zh'] & {
    font-style: normal;
  }
`

const GlobalSystemLabel = styled.span`
  color: #ebeae4;
  font-size: 28px;
  font-weight: 700;
  left: 50%;
  letter-spacing: 1.15px;
  position: absolute;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
  text-transform: uppercase;
  top: 50%;
  transform: translate(-50%, -50%);
`
