/**
 * @providesModule RecentCommentThreads
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'

import { CoverImageContainer } from 'overview/BillboardTitle'
import CommunityChooser from 'overview/CommunityChooser'
import CommentThreadItem from 'conversation/CommentThreadItem'
import { ScrollView } from 'conversation/shared'

import type { State } from 'redux/state'

function mapStateToProps ({ caseData, ui }: State) {
  const { coverUrl } = caseData
  const { mostRecentCommentThreads } = ui
  return {
    coverUrl,
    mostRecentCommentThreads,
  }
}

const RecentCommentThreads = ({ coverUrl, mostRecentCommentThreads }) => (
  <Container>
    <CoverImageContainer src={coverUrl} />
    <Shadow>
      <CommunityChooser />
    </Shadow>
    <ScrollView maxHeight="calc(100vh - 216px)">
      {mostRecentCommentThreads.map(id => (
        <CommentThreadItem key={id} id={id} />
      ))}
    </ScrollView>
  </Container>
)
export default connect(mapStateToProps)(RecentCommentThreads)

const Container = styled.div`
  flex: 1;
  max-width: 450px;
  background-color: #ebeae4;
  border-radius: 2px;
  margin-top: 30px;
`

const Shadow = styled.div`
  box-shadow: 0px -17px 16px 16px #35526f;
`
