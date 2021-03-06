/**
 * @providesModule RecentCommentThreads
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'

import { NonIdealState } from '@blueprintjs/core'

import CommunityChooser from 'overview/CommunityChooser'
import CommentThreadItem from 'conversation/CommentThreadItem'
import NewUnattachedCommentButton from 'conversation/NewUnattachedCommentButton'
import ScrollView from 'utility/ScrollView'

import type { State } from 'redux/state'

function mapStateToProps ({ caseData, ui }: State) {
  const { coverUrl, reader } = caseData
  const { activeCommunity } = reader || {}
  const { mostRecentCommentThreads } = ui
  return {
    activeCommunity,
    coverUrl,
    mostRecentCommentThreads,
  }
}

const RecentCommentThreads = ({
  activeCommunity,
  coverUrl,
  mostRecentCommentThreads,
}) => (
  <Container>
    <CoverImage src={coverUrl} />
    <Shadow>
      <CommunityChooser />
    </Shadow>
    <ScrollView maxHeightOffset="215px">
      <>
        <NewUnattachedCommentButton />
        {mostRecentCommentThreads == null ? (
          <Loading />
        ) : mostRecentCommentThreads.length > 0 ? (
          mostRecentCommentThreads.map(id => (
            <CommentThreadItem key={id} id={id} />
          ))
        ) : (
          <NoComments activeCommunity={activeCommunity} />
        )}
      </>
    </ScrollView>
  </Container>
)
// $FlowFixMe
export default connect(
  mapStateToProps,
  () => ({})
)(RecentCommentThreads)

const Container = styled.div`
  flex: 1;
  max-width: 450px;
  background-color: #ebeae4;
  border-radius: 2px;
  margin-top: 30px;
  z-index: 1;

  @media (max-width: 1000px) {
    width: calc(30vw - 16px);
  }
`

const CoverImage = styled.div`
  background-color: hsl(209, 53%, 76%);
  background-image: url(${p => p.src});
  background-position: center;
  background-size: cover;
  border-radius: 3px 3px 0 0;
  height: 50px;
  position: relative; /* new stacking context lifts it above Shadow */
`

const Shadow = styled.div`
  box-shadow: 0px -17px 16px 16px #35526f;
`

const Loading = styled.div`
  background-color: #415e77;
  height: 300px;
`

const NoComments = injectIntl(({ activeCommunity, intl }) => (
  <PaddedNonIdealState
    visual="chat"
    title={intl.formatMessage({
      id: 'comments.index.noComments',
    })}
    description={intl.formatMessage(
      { id: 'comments.index.nobodyHasLeftAComment' },
      { communityName: activeCommunity ? activeCommunity.name : '' }
    )}
    // action={
    // }
  />
))

const PaddedNonIdealState = styled(NonIdealState)`
  margin: 45px auto 40px;
`
