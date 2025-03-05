/**
 * The contents of the detail view of the Conversation master–detail interface
 * when no comment thread is selected in the master view.
 *
 * @providesModule NoSelectedCommentThread
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import Markdown from 'utility/Markdown'

import type { State } from 'redux/state'

function mapStateToProps (state: State) {
  const { reader } = state.caseData
  const { activeCommunity } = reader || {}

  return activeCommunity || {}
}

const NoSelectedCommentThread = ({ name, description }) => (
  <Container>
    {description && (
      <>
        <h2>{name || ''}</h2>
        <Markdown source={description || ''} />
      </>
    )}
  </Container>
)
// $FlowFixMe
export default connect(
  mapStateToProps,
  () => ({})
)(NoSelectedCommentThread)

const Container = styled.div.attrs({ className: 'bp3-running-text' })`
  flex: 1;
  max-width: 633px;
  height: calc(100vh - 140px);
  margin: 30px 0 0 36px;
  padding: 30px;
  background-color: #415e77;
  border-radius: 2px;
  color: white;

  @media (max-width: 700px) {
    display: none;
  }

  & h2 {
    font-family: ${p => p.theme.sansFont};
    color: white;
  }
`
