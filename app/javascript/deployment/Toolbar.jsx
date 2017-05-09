/**
 * @providesModule Toolbar
 * @flow
 */

import React from 'react'
import styled from 'styled-components'

import { Button } from '@blueprintjs/core'

type Props = {
  caseData: {
    kicker: string,
    title: string,
    coverUrl: string,
  },
  withPretest: boolean,
  withPosttest: boolean,
  onTogglePretest: () => void,
  onDeselect: () => void,
}

const Toolbar = ({
  caseData,
  withPretest,
  withPosttest,
  onTogglePretest,
  onDeselect,
}: Props) => {
  const { coverUrl, kicker } = caseData
  return (
    <BottomFixedToolbar className="pt-navbar">
      <div className="pt-navbar-group pt-align-left">
        <CaseIcon src={coverUrl} />
        <div className="pt-navbar-heading">{kicker}</div>
      </div>
      <div className="pt-navbar-group pt-align-right">
        <Switch
          checked={withPretest}
          yes="With pre/post comparison"
          no="No pre-test"
          disabled={!withPosttest}
          onClick={onTogglePretest}
        />
        <Switch
          checked={withPosttest}
          yes="With quiz"
          no="No quiz"
          disabled={!withPosttest}
          onClick={onDeselect}
        />
        <button
          className="pt-button pt-intent-success"
          style={{ marginLeft: 10 }}
        >
          Deploy
        </button>
      </div>
    </BottomFixedToolbar>
  )
}

export default Toolbar

type SwitchParams = {
  checked: boolean,
  yes: string,
  no: string,
  disabled?: boolean,
  onClick: () => void,
}
const Switch = ({
  checked,
  yes,
  no,
  onClick,
  disabled = false,
}: SwitchParams) => (
  <Button
    className="pt-minimal"
    iconName={checked ? 'tick' : 'cross'}
    disabled={disabled}
    onClick={onClick}
  >
    {checked ? yes : no}
  </Button>
)

const BottomFixedToolbar = styled.nav`
  position: fixed;
  bottom: 12px;
  width: calc(100% - 24px);
  left: 12px;
  z-index: 20;
`

const CaseIcon = styled.img`
  height: 36px;
  width: 36px;
  margin-right: 12px;
  border-radius: 3px;
  box-shadow: 0 0 0 1px rgba(16, 22, 26, 0.4);
`
