/**
 * @providesModule GroupChooser
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import type { State, Group } from 'redux/state'

type OwnProps = { rounded: boolean }
function mapStateToProps ({ caseData }: State, { rounded }: OwnProps) {
  const { reader } = caseData
  return { rounded, activeGroup: reader && reader.activeGroup }
}

type Props = { activeGroup: ?Group, rounded: boolean }
export const UnconnectedGroupChooser = ({ activeGroup, rounded }: Props) =>
  <Bar empty={!activeGroup} rounded={rounded}>
    {activeGroup &&
      <GroupName>
        {activeGroup.name}
      </GroupName>}
  </Bar>

export default connect(mapStateToProps)(UnconnectedGroupChooser)

const Bar = styled.div`
  background-color: #373566;
  font-size: 10pt;
  line-height: 1.2;
  text-align: center;
  width: 100%;
  padding: ${({ empty }) => (empty ? '0' : '5px')};
  border-bottom-width: 4px;
  border-bottom-style: solid;
  border-bottom-color: ${({ empty }) => (empty ? '#6acb72' : '#8764ea')};
  border-radius: ${({ rounded }) => (rounded ? '0 0 2pt 2pt' : '0')};
`

const GroupName = styled.span`
  font-weight: bold;
  color: #d4c5ff;
  display: inline-block;
`
