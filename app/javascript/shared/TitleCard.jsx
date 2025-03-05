/**
 * The block containing the cover image, title, kicker, and authors names,
 * shared between the case overview and the catalog features block.
 *
 * @providesModule TitleCard
 * @flow
 */

import * as React from 'react'
import styled, { css } from 'styled-components'

import { FormattedList } from 'shared/react-intl'
import { FeaturesCell } from 'catalog/home/shared'
import { Container as BillboardTitleContainer } from 'overview/BillboardTitle'
import { Container as SidebarContainer } from 'elements/Sidebar'
import { Container as MagicLinkContainer } from 'magic_link/shared'

import type { Author } from 'redux/state'

type Props = {
  kicker: string,
  title: string,
  authors: Author[],
  photoCredit: string,
  coverUrl: string,
}

function TitleCard ({ authors, coverUrl, kicker, photoCredit, title }: Props) {
  return (
    <Container>
      <Image src={coverUrl}>
        {/* TODO: LabelForScreenReaders: Photo Credit: */}
        <PhotoCredit>{photoCredit}</PhotoCredit>
      </Image>

      <Title>
        <Kicker>{kicker}</Kicker>
        <Question>{title}</Question>
      </Title>

      <Authors>
        <FormattedList
          list={authors.map(author => (
            <span key={author.name}>{author.name}</span>
          ))}
          truncate={{ after: 3, with: 'et al.' }}
        />
      </Authors>
    </Container>
  )
}

export default TitleCard

const grid = {
  oneColumn: css`
    grid-template-areas: 'image' 'title' 'authors';
    grid-template-columns: auto !important;
    grid-template-rows: 100px auto auto;
  `,
  twoColumn: css`
    grid-template-areas: 'image title' 'image authors';
    grid-template-columns: minmax(25%, 240px) auto;
  `,
}

function secondRow (style) {
  return css`
    ${FeaturesCell}:nth-last-child(-n + 4) & {
      ${style}
    }
  `
}

function smallScreen (style) {
  return css`
    @media (max-width: 900px) {
      ${style}
    }
  `
}

function inSmallFeatureCell (style) {
  return css`
    ${secondRow(style)}

    ${FeaturesCell} & {
      @media (max-width: 900px) {
        ${style}
      }
    }
  `
}

function whenOneColumn (style) {
  return css`
    ${FeaturesCell} & {
      ${smallScreen(style)}
    }

    ${secondRow(css`
      @media (min-width: 1150px) and (max-width: 1440px) {
        ${style}
      }

      ${smallScreen(style)}
    `)}

    ${BillboardTitleContainer} & {
      ${smallScreen(style)}
    }

    ${SidebarContainer} & {
      ${style}
    }
  `
}

export const Container = styled.div`
  background-color: hsl(209, 83%, 90%);
  display: grid;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;

  border-radius: 3px 3px 0 0;

  ${FeaturesCell} &,
  ${MagicLinkContainer} & {
    box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.1), 0 1px 1px 0 rgba(0, 0, 0, 0.2),
      0 2px 6px 0 rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  ${MagicLinkContainer} & {
    height: unset;
  }

  ${SidebarContainer} & {
    border-radius: 3px;
    border-bottom: 4px solid #6ACB72;
  }

  ${grid.twoColumn}

  ${secondRow(
    css`
      grid-template-columns: minmax(30%, 125px) auto;
    `
  )}

  ${whenOneColumn(grid.oneColumn)}
`

// $FlowFixMe
export const Image = styled.div.attrs({ className: 'bp3-dark' })`
  background-color: hsl(209, 53%, 76%);
  background-image: ${p => css`url(${p.src})`};
  background-position: center;
  background-size: cover;
  display: flex;
  flex-direction: column;
  grid-area: image;
  justify-content: flex-end;
  min-height: 100px;
  min-width: 100px;
  position: relative;

  box-shadow: inset -1px 0 0 hsla(0, 0%, 0%, 0.2);

  ${whenOneColumn(css`
    box-shadow: inset 0 -1px 0 hsla(0, 0%, 0%, 0.2);
  `)}
`

export const PhotoCredit = styled.cite`
  color: hsla(0, 0%, 100%, 0.7);
  font-size: 9px;
  font-style: normal;
  font-weight: 500;
  line-height: 11px;
  margin: 3px 5px;
  text-align: end;
  text-shadow: 0 0 10px hsla(0, 0%, 0%, 0.5);
  text-transform: uppercase;

  .bp3-editable-text-placeholder > .bp3-editable-text-content {
    color: hsla(0, 0%, 100%, 0.7);
  }
`

export const Title = styled.h1`
  grid-area: title;

  margin: 30px;

  ${inSmallFeatureCell(css`
    margin: 20px;
  `)}

  ${BillboardTitleContainer} & {
    ${smallScreen(css`
      margin: 20px;
    `)}
  }

  ${SidebarContainer} & {
    margin: 10px;
  }
`

export const Kicker = styled.span`
  color: hsl(209, 57%, 39%);
  display: block;
  font-family: ${p => p.theme.sansFont};
  font-size: 16px;
  line-height: 17px;
  margin: -1px 0 10px;

  ${SidebarContainer} & {
    color: hsl(209, 52%, 24%);
    font-size: 14px;
    letter-spacing: 0.2;
    line-height: 15px;
    margin: 0;
  }
`

export const Question = styled.span`
  color: hsl(209, 52%, 24%);
  display: block;
  font-family: ${p => p.theme.sansFont};

  font-size: 26px;
  line-height: 28px;

  ${FeaturesCell} & {
    @media (max-width: 1300px) {
      font-size: 22px;
      line-height: 24px;
    }
  }

  ${inSmallFeatureCell(css`
    font-size: 18px;
    line-height: 19px;
  `)}

  ${BillboardTitleContainer} & {
    ${smallScreen(css`
      font-size: 22px;
      line-height: 24px;
    `)}
  }

  ${SidebarContainer} & {
    display: none;
  }
`

export const Authors = styled.div`
  align-self: flex-end;
  color: hsl(209, 63%, 35%);
  font-size: 14px;
  grid-area: authors;
  line-height: 17px;

  margin: 0 30px 30px;

  ${secondRow(css`
    margin: 0 20px 20px;
  `)}

  ${smallScreen(css`
    margin: 0 20px 20px;
  `)}

  ${FeaturesCell} & {
    ${smallScreen(css`
      display: none;
    `)}
    }
  }
  ${SidebarContainer} & {
    display: none;
  }
`
