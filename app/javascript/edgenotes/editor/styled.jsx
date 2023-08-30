/**
 * @flow
 */

import styled, { css } from 'styled-components'
import { Button, Dialog as BaseDialog, Intent } from '@blueprintjs/core'

export const Overlay = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  z-index: 1;
`

// $FlowFixMe
export const EditButton = styled(Button).attrs({
  intent: Intent.SUCCESS,
  icon: 'edit',
})`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  box-shadow: 0 0 10px white;
`

// $FlowFixMe
export const Dialog = styled(BaseDialog)`
  width: 772px;
`

// $FlowFixMe
export const Body = styled.div.attrs({ className: 'pt-dialog-body' })`
  align-items: flex-start;
  display: flex;
  flex-flow: row;

  @media (max-width: 600px) {
    flex-flow: column;
  }
`

export const Column = styled.div`
  width: 100%;

  ${p =>
    p.sticky &&
    window.CSS.supports('position: sticky') &&
    css`
      /**
       * Safari’s implementation of position: -webkit-sticky barfs all over the
       * place, but because @supports is autoprefixed by stylis, we can’t detect
       * actual non-prefixed position: sticky in that way.
       */

      @media (min-width: 600px) {
        position: sticky;
        top: 1em;
      }
    `};

  ${p =>
    p.layout === "bottom_full_width" &&
    css`
      @media (min-width: 600px) {
        width: 200%;
      }
    `};
`

export const Separator = styled.div`
  padding: 1em;
`
