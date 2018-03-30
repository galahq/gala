/**
 * @flow
 */

import styled from 'styled-components'
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

  opacity: 0;
  transition: opacity 0.1s ease-out;

  &:hover,
  &:focus-within {
    opacity: 1;
  }
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
`

export const Body = styled.div.attrs({ className: 'pt-dialog-body' })`
  display: flex;
  flex-flow: row;

  @media (max-width: 600px) {
    flex-flow: column-reverse;
  }
`

export const Column = styled.div`
  width: 100%;
`

export const Separator = styled.div`
  padding: 1em;
`
