/**
 * @providesModule SelectedCommentThread
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'

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
