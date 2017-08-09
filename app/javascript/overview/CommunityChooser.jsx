/**
 * @providesModule CommunityChooser
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import type { State, Community } from 'redux/state'

type OwnProps = { rounded: boolean }
function mapStateToProps ({ caseData }: State, { rounded }: OwnProps) {
  const { reader } = caseData
  return { rounded, activeCommunity: reader && reader.activeCommunity }
}

type Props = { activeCommunity: ?Community, rounded: boolean }
export const UnconnectedCommunityChooser = ({
  activeCommunity,
  rounded,
}: Props) =>
  <Bar empty={!activeCommunity} rounded={rounded}>
    {activeCommunity &&
      <CommunityName>
        {activeCommunity.name}
      </CommunityName>}
  </Bar>

export default connect(mapStateToProps)(UnconnectedCommunityChooser)

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

const CommunityName = styled.span`
  font-weight: bold;
  color: #d4c5ff;
  display: inline-block;
`
