/**
 * @providesModule Toolbar
 * @flow
 */

import React from 'react'
import styled from 'styled-components'

type Props = {
  caseData: {
    kicker: string,
    title: string,
    coverUrl: string,
  },
  withPretest: boolean,
  withPosttest: boolean,
}

const Toolbar = ({ caseData, withPretest, withPosttest }: Props) => {
  const { coverUrl, kicker } = caseData
  return (
    <BottomFixedToolbar className="pt-navbar">
      <div className="pt-navbar-group pt-align-left">
        <CaseIcon src={coverUrl} />
        <div className="pt-navbar-heading">{kicker}</div>
      </div>
      <div className="pt-navbar-group pt-align-right">
        <Switch checked label="Pre/post comparison" />
        <Switch checked label="Quiz active" />
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

const Switch = ({
  checked,
  label,
  disabled = false,
}: { checked: boolean, label: string, disabled?: boolean }) => (
  <button
    className={`pt-button pt-minimal pt-icon-${checked ? 'tick' : 'cross'}`}
    disabled={disabled}
  >
    {label}
  </button>
)

const BottomFixedToolbar = styled.nav`
  position: fixed;
  bottom: 12px;
  width: calc(100% - 24px);
  left: 12px;
`

const CaseIcon = styled.img`
  height: 36px;
  width: 36px;
  margin-right: 12px;
  border-radius: 3px;
  box-shadow: 0 0 0 1px rgba(16, 22, 26, 0.4);
`
