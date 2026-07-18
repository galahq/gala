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
    <BottomFixedToolbar className="bp6-navbar bp6-navbar">
      <div className="bp6-navbar-group bp6-navbar-group bp6-align-left bp6-align-left">
        <CaseIcon src={coverUrl} />
        <div className="bp6-navbar-heading bp6-navbar-heading">{kicker}</div>
      </div>

      <div className="bp6-navbar-group bp6-navbar-group bp6-align-right bp6-align-right">
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
          className="bp6-button bp6-button bp6-intent-success bp6-intent-success"
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
