/**
 * @providesModule Overlay
 * @flow
 */

import * as React from 'react'
import styled, { css } from 'styled-components'

type Props = { children?: React.Node, theme?: 'LIGHT' | 'DARK' }

function Overlay ({ children, theme = 'DARK' }: Props) {
  return (
    <>
      <Background theme={theme} />
      <Foreground>{children}</Foreground>
    </>
  )
}

export default Overlay

const Background = styled.div`
  border-radius: 2pt;
  height: calc(100% + 16px);
  left: -8px;
  margin: 0;
  mix-blend-mode: hard-light;
  position: absolute;
  top: -8px;
  width: calc(100% + 16px);
  z-index: 10;

  ${p => {
    const themes = {
      DARK: css`
        background-color: hsl(208, 30%, 23%);
        border: 1px solid black;
      `,
      LIGHT: css`
        background-color: hsl(208, 11%, 59%);
        border: 1px solid hsla(208, 1%, 98%, 60%);
      `,
    }
    return themes[p.theme]
  }};
`
const Foreground = styled.div.attrs({ className: 'pt-card pt-elevation-4' })`
  background-color: #fdfdfa !important;
  color: #01182e !important;
  left: 50%;
  opacity: 0;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  transition: 0.2s ease-out opacity 0.1s;
  width: 300px;
  z-index: 11;

  ${Background}:hover + &,
  &:hover,
  &:focus-within {
    opacity: 1;
  }

  .pt-callout.pt-intent-primary[class*='pt-icon-']::before,
  .pt-callout.pt-intent-primary h5 {
    color: #6344bc !important;
  }

  .pt-callout.pt-intent-danger[class*='pt-icon-']::before,
  .pt-callout.pt-intent-danger h5 {
    color: #c23030 !important;
  }

  h5 {
    font-family: ${p => p.theme.sansFont};
    line-height: 20px;
    margin: 0 0 5px 0;
  }

  p {
    font-family: ${p => p.theme.sansFont};
    font-weight: 400;
    line-height: 1.4;
    margin: 0 0 0.65em;
  }

  button {
    box-shadow: inset 0 0 0 1px rgba(16, 22, 26, 0.4),
      inset 0 -1px 0 rgba(16, 22, 26, 0.2) !important;
  }
`
