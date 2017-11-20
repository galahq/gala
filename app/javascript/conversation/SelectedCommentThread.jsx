/**
 * @providesModule SelectedCommentThread
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'

import { InputGroup } from '@blueprintjs/core'

import LeadComment from 'conversation/LeadComment'
import Responses from 'conversation/Responses'
import { ScrollView } from 'conversation/shared'
import Identicon from 'shared/Identicon'

import type { ContextRouter } from 'react-router-dom'
import type { State } from 'redux/state'

function mapStateToProps (
  { commentThreadsById, commentsById, cardsById, pagesById, caseData }: State,
  { match }: ContextRouter
) {
  if (match.params.threadId == null) return {}

  const commentThread = commentThreadsById[match.params.threadId]
  const { id: threadId, originalHighlightText, cardId, readers } = commentThread
  const { position: cardPosition, pageId } = cardsById[cardId]
  const { title: pageTitle, position: pagePosition } = pagesById[pageId]
  const [leadCommenter] = readers
  const [leadComment, ...responses] = commentThread.commentIds.map(
    id => commentsById[id]
  )
  const { reader } = caseData

  const inSituPath = `/${pagePosition}/cards/${cardId}/comments/${threadId}`

  return {
    cardPosition,
    inSituPath,
    leadComment,
    leadCommenter,
    originalHighlightText,
    pageTitle,
    reader,
    responses,
  }
}

const SelectedCommentThread = ({
  cardPosition,
  inSituPath,
  leadComment,
  leadCommenter,
  originalHighlightText,
  pageTitle,
  reader,
  responses,
}) => (
  <Container>
    <ScrollView maxHeight="calc(100vh - 163px)">
      <CommentsContainer>
        <LeadComment
          cardPosition={cardPosition}
          inSituPath={inSituPath}
          leadComment={leadComment}
          originalHighlightText={originalHighlightText}
          pageTitle={pageTitle}
          reader={leadCommenter}
        />
        <Responses responses={responses} />
      </CommentsContainer>
    </ScrollView>

    <NewCommentForm>
      <Identicon width={32} reader={reader} />
      <InputGroup
        placeholder="Write a message"
        rightElement={
          <button className="pt-button pt-minimal pt-intent-primary pt-icon-upload" />
        }
      />
    </NewCommentForm>
  </Container>
)
export default connect(mapStateToProps)(SelectedCommentThread)

const Container = styled.div`
  flex: 1;
  max-width: 633px;
  margin-left: 36px;
  position: relative;

  &::before {
    position: absolute;
    box-shadow: inset 0px 16px 16px -16px #35526f;
    top: 0;
    width: 100%;
    height: 10px;
    content: '';
    z-index: 100;
  }
`

const CommentsContainer = styled.div`
  margin-top: 30px;
  padding: 30px;
  background-color: #ebeae4;
  border-radius: 2px 2px 0 0;
`

const NewCommentForm = styled.div`
  display: flex;
  align-items: center;
  background-color: #ebeae4;
  border-top: 1px solid #bfbdac;
  border-radius: 0 0 2px 2px;
  padding: 11px;

  & .pt-input-group {
    flex: 1;
    margin-left: 11px;
  }
`
