/**
 * @providesModule SelectedCommentThread
 * @flow
 */

import * as React from 'react'
import styled, { css } from 'styled-components'
import { connect } from 'react-redux'

import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

import LeadComment from 'conversation/LeadComment'
import Responses from 'conversation/Responses'
import NewCommentForm from 'conversation/NewCommentForm'
import { ScrollView, NoSelectedCommentThread } from 'conversation/shared'
import { LabelForScreenReaders, FocusContainer } from 'utility/A11y'

import type { ContextRouter } from 'react-router-dom'
import type { ExtractReturn, State } from 'redux/state'

type OwnProps = {|
  ...ContextRouter,
  inSitu?: boolean,
  heightOffset: number,
|}

function mapStateToProps (
  { commentThreadsById, commentsById, cardsById, pagesById }: State,
  ownProps: OwnProps
) {
  const commentThread = commentThreadsById[ownProps.match.params.threadId || '']
  if (commentThread == null) return {}

  const { id: threadId, originalHighlightText, cardId, readers } = commentThread
  const { position: cardPosition, pageId } = cardsById[cardId]
  const page = pagesById[pageId]
  const [leadCommenter] = readers
  const [leadComment, ...responses] = commentThread.commentIds.map(
    id => commentsById[id]
  )

  const inSituPath = `/${page.position}/cards/${cardId}/comments/${threadId}`

  return {
    ...ownProps,
    cardPosition,
    inSituPath,
    leadComment,
    leadCommenter,
    originalHighlightText,
    page,
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
      heightOffset,
      inSitu,
      inSituPath,
      leadComment,
      leadCommenter,
      originalHighlightText,
      page,
      responses,
      threadId,
    } = this.props
    const { formHeight } = this.state
    return !leadComment ? (
      <NoSelectedCommentThread />
    ) : (
      <Container inSitu={inSitu}>
        <FocusContainer priority={2}>
          <ScrollView maxHeightOffset={`${heightOffset}px + ${formHeight}px`}>
            <CommentsContainer>
              <LabelForScreenReaders visibleBelowMaxWidth={inSitu ? 1279 : 699}>
                <AllCommentsButton
                  replace
                  to={
                    inSitu
                      ? inSituPath.replace(new RegExp(`/${threadId}$`), '')
                      : '/conversation'
                  }
                >
                  <FormattedMessage
                    id="conversation.allComments"
                    defaultMessage="All comments"
                  />
                </AllCommentsButton>
              </LabelForScreenReaders>
              <LeadComment
                cardPosition={cardPosition}
                inSitu={inSitu}
                inSituPath={inSituPath}
                leadComment={leadComment}
                originalHighlightText={originalHighlightText}
                page={page}
                reader={leadCommenter}
              />
              <Responses responses={responses} />
            </CommentsContainer>
          </ScrollView>

          <NewCommentForm
            threadId={threadId}
            onResize={this.handleFormResize}
          />
        </FocusContainer>
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
  display: flex;
  flex-direction: column;
  ${({ inSitu }: { inSitu: boolean }) =>
    inSitu &&
    css`
      position: fixed;
      top: 0;
      font-weight: 400;
      margin-left: 0;
    `};

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
`
