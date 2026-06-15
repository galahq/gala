/**
 * @providesModule Toolbar
 *
 */

import React from 'react'
import styled from 'styled-components'

import { Switch as BaseSwitch } from '@blueprintjs/core'


const Toolbar = ({
  caseData,
  withPretest,
  withPosttest,
  onTogglePretest,
  onTogglePosttest,
  onSubmit,
}) => {
  const { coverUrl, kicker } = caseData
  return (
    <BottomFixedToolbar className="pt-navbar bp4-navbar">
      <div className="pt-navbar-group bp4-navbar-group pt-align-left bp4-align-left">
        <CaseIcon src={coverUrl} />
        <div className="pt-navbar-heading bp4-navbar-heading">{kicker}</div>
      </div>

      <div className="pt-navbar-group bp4-navbar-group pt-align-right bp4-align-right">
        <Switch
          checked={withPretest}
          label="Use pre-test"
          disabled={!withPosttest}
          onChange={onTogglePretest}
        />
        <Switch
          checked={withPosttest}
          label="Use post-test"
          onChange={onTogglePosttest}
        />

        <button
          className="pt-button bp4-button pt-intent-success bp4-intent-success"
          style={{ marginLeft: 10 }}
          onClick={onSubmit}
        >
          Deploy
        </button>
      </div>
    </BottomFixedToolbar>
  )
}

export default Toolbar

const BottomFixedToolbar = styled.nav`
  position: fixed;
  bottom: 12px;
  width: calc(100% - 24px);
  left: 12px;
  z-index: 20;

  .window-admin & {
    bottom: 2rem;
    left: 2rem;
    width: calc(100% - 4rem);
  }
`

const CaseIcon = styled.img`
  height: 36px;
  width: 36px;
  margin-right: 12px;
  border-radius: 3px;
  box-shadow: 0 0 0 1px rgba(16, 22, 26, 0.4);
`

const Switch = styled(BaseSwitch)`
  margin: 0 1em 0 0;
`
