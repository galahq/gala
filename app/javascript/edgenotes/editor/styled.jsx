/**
 * 
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

export const Dialog = styled(BaseDialog)`
  width: 772px;

  /* Prod parity, measured against learngala.com's edgenote editor. The warm-tan
     body + cream header are handled globally for light dialogs (blueprint-theme.scss);
     the rest is editor-specific:
     - 18px dialog title (the global dialog-title rule sizes it 16px)
     - 20px body margin (BP6 default is 16px)
     - 16px/600 section headings (bare <h5> otherwise renders smaller/heavier) */
  & .bp6-dialog-header {
    /* Align the header content with the 20px body margin (BP6 indents it 16px). */
    padding-left: 20px;
  }

  /* Header edit icon: prod is 20px; BP6 renders dialog header icons at 16px. */
  & .bp6-dialog-header .bp6-icon svg {
    width: 20px;
    height: 20px;
  }

  & .bp6-dialog-header .bp6-heading {
    font-size: 18px;
  }

  & .bp6-dialog-body {
    margin: 20px;
    /* Prod's tight, uniform line-height (measured 18px). BP6's looser base spacing
       made the multi-line help/description text read as over-spaced. Inherited by
       the helper text (which sets no line-height of its own). */
    line-height: 18px;
  }

  & .bp6-dialog-body h5 {
    font-size: 16px;
    font-weight: 600;
  }
`

export const Body = styled.div.attrs({ className: 'bp6-dialog-body' })`
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
`

export const Separator = styled.div`
  padding: 1em;
`
