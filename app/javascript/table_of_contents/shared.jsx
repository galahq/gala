/*
 * @flow
 */

import styled, { css } from 'styled-components'
import { NavLink } from 'react-router-dom'

export const Title = styled.h2`
  color: #faf9f5;
  font-family: ${p => p.theme.sansFont};
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  margin: 1.6em 0 0.8em 0;
`

// $FlowFixMe
export const OuterContainer = styled.div.attrs({ className: 'bp3-dark' })``

// $FlowFixMe
export const Container = styled.nav.attrs(p => ({
  className: `c-toc ${p.disabled ? 'c-toc--disabled' : ''}`,
}))``

export const NoElements = styled.p`
  margin: 0.5em;
  opacity: 0.5;
`

export const List = styled.ol`
  list-style: none;
  font-size: 15px;
  line-height: 1.2;
  margin: 0;
  margin-bottom: 1em;
  padding: 0;
  width: 100%;

  ${p =>
    p.isDraggingOver &&
    css`
      & ${Link}:hover {
        background-color: transparent !important;
      }
    `}
`

export const Item = styled.li``

// $FlowFixMe
export const Link = styled(NavLink)`
  color: #ebeae4;
  display: flex;
  flex-direction: row;

  ${p =>
    p.isDragging
      ? css`
          background-color: #29394a !important;
          color: #ebeae4 !important;
        `
      : css`
          a&:hover,
          &[aria-current] {
            background-color: #29394a;
            color: #ebeae4 !important;
          }
        `}
`

export const Label = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 45px;
  font-weight: 800;
  justify-content: center;
  transform: scale(1.1);
`

export const Details = styled.div`
  align-items: center;
  border-top: 1px solid rgba(235, 234, 228, 0.2);
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  padding: 11px 0;

  ${Item}:first-of-type & {
    border-top: none;
  }
`

// $FlowFixMe
export const ElementIcon = styled(Label)`
  padding-right: 0.5em;
`

// $FlowFixMe
export const Actions = styled.div.attrs({
  className: props =>
    `c-toc__actions bp3-button-group bp3-fill ${
      props.vertical ? 'bp3-vertical' : ''
    }`,
})``

// $FlowFixMe
export const AddButton = styled.button.attrs({
  type: 'button',
  className: 'bp3-button bp3-icon-add',
})``

// $FlowFixMe
export const AssessmentButton = styled(Link).attrs({
  className: 'bp3-button bp3-fill bp3-icon-properties bp3-intent-success',
})`
  margin-top: 1em;
`
