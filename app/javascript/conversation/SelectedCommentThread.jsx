/**
 * @providesModule SelectedCommentThread
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'

import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

import LeadComment from 'conversation/LeadComment'
import Responses from 'conversation/Responses'
import NewCommentForm from 'conversation/NewCommentForm'
import { ScrollView, NoSelectedCommentThread } from 'conversation/shared'

import type { ContextRouter } from 'react-router-dom'
import type { ExtractReturn, State } from 'redux/state'

function mapStateToProps (
  { commentThreadsById, commentsById, cardsById, pagesById }: State,
  { match }: ContextRouter
) {
  const commentThread = commentThreadsById[match.params.threadId || '']
  if (commentThread == null) return {}

  const { id: threadId, originalHighlightText, cardId, readers } = commentThread
  const { position: cardPosition, pageId } = cardsById[cardId]
  const { title: pageTitle, position: pagePosition } = pagesById[pageId]
  const [leadCommenter] = readers
  const [leadComment, ...responses] = commentThread.commentIds.map(
    id => commentsById[id]
  )

  const inSituPath = `/${pagePosition}/cards/${cardId}/comments/${threadId}`

  return {
    cardPosition,
    inSituPath,
    leadComment,
    leadCommenter,
    originalHighlightText,
    pageTitle,
    responses,
    threadId,
  }
}

type Props = ExtractReturn<typeof mapStateToProps>
class SelectedCommentThread extends React.Component<
  Props,
  { formHeight: number }
> {
  state = { formHeight: 57 }

  handleFormResize = (formHeight: number) => this.setState({ formHeight })

  render () {
    const {
      cardPosition,
      inSituPath,
      leadComment,
      leadCommenter,
      originalHighlightText,
      pageTitle,
      responses,
      threadId,
    } = this.props
    const { formHeight } = this.state
    return !leadComment ? (
      <NoSelectedCommentThread />
    ) : (
      <Container>
        <ScrollView maxHeightOffset={`108px + ${formHeight}px`}>
          <CommentsContainer>
            <AllCommentsButton to="/conversation">
              <FormattedMessage
                id="conversation.allComments"
                defaultMessage="All comments"
              />
            </AllCommentsButton>
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

        <NewCommentForm threadId={threadId} onResize={this.handleFormResize} />
      </Container>
    )
  }
}
export default connect(mapStateToProps)(SelectedCommentThread)

const Container = styled.div`
  flex: 1;
  max-width: 633px;
  margin-left: 16px;
  position: relative;
  display: flex;
  flex-direction: column;

  &::before {
    position: absolute;
    box-shadow: inset 0px 16px 16px -16px #35526f;
    top: 0;
    width: 100%;
    height: 10px;
    content: '';
    z-index: 100;
  }

  @media (max-width: 700px) {
    max-width: 700px;
    background-color: #35536f;
    position: fixed;
    width: 100vw;
    height: 100%;
    margin: 0;
    left: 0;
    top: 0;

    & .ScrollView {
      max-height: none;
    }
  }
`

const CommentsContainer = styled.div`
  margin-top: 30px;
  padding: 30px;
  background-color: #ebeae4;
  border-radius: 2px 2px 0 0;

  @media (max-width: 700px) {
    margin: 6px 6px 0 6px;
    min-height: 100%;
  }
`

const AllCommentsButton = styled(Link).attrs({
  className: 'pt-button pt-minimal pt-icon-arrow-left',
})`
  margin: -10px 0 15px -32px;
  @media (min-width: 699px) {
    display: none;
  }
`
