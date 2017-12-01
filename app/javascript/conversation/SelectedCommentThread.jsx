/**
 * @providesModule SelectedCommentThread
 * @flow
 */

import * as React from 'react'
import styled, { css } from 'styled-components'
import { connect } from 'react-redux'

import { Link, Redirect } from 'react-router-dom'
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
  { caseData, commentThreadsById, commentsById, cardsById, pagesById }: State,
  ownProps: OwnProps
) {
  const threadId = ownProps.match.params.threadId || ''
  const commentThread = commentThreadsById[threadId]
  if (commentThread == null) return {}

  const { reader: activeReader } = caseData
  const { originalHighlightText, cardId, readerId, readers } = commentThread
  const { position: cardPosition, pageId } = cardsById[cardId]
  const page = pagesById[pageId]
  const leadCommenter = readers[0] || activeReader
  const comments = commentThread.commentIds.map(id => commentsById[id])
  const leadComment: ?* = comments[0]
  const [, ...responses] = comments

  const inSituPath = `/${page.position}/cards/${cardId}/comments/${threadId}`

  return {
    ...ownProps,
    activeReader,
    cardPosition,
    inSituPath,
    leadComment,
    leadCommenter,
    originalHighlightText,
    page,
    readerId,
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

  scrollView: ?HTMLDivElement

  handleFormResize = (formHeight: number) => this.setState({ formHeight })

  componentDidUpdate (prevProps) {
    const { threadId, responses, activeReader } = this.props
    if (
      prevProps.threadId === threadId &&
      prevProps.responses.length < responses.length &&
      responses[responses.length - 1].reader.id === activeReader.id &&
      this.scrollView != null
    ) {
      this.scrollView.scrollTop = this.scrollView.scrollHeight
    }
  }

  render () {
    const {
      cardPosition,
      heightOffset,
      inSitu,
      inSituPath,
      leadComment,
      leadCommenter,
      location,
      originalHighlightText,
      page,
      readerId,
      responses,
      threadId,
    } = this.props
    const backPath = location.pathname.replace(new RegExp(`/${threadId}$`), '')
    const { formHeight } = this.state
    return readerId != null ? (
      <Container inSitu={inSitu}>
        <FocusContainer priority={2}>
          <ScrollView
            innerRef={scrollView => (this.scrollView = scrollView)}
            maxHeightOffset={`${heightOffset}px + ${formHeight}px`}
          >
            <CommentsContainer>
              <LabelForScreenReaders visibleBelowMaxWidth={inSitu ? 1279 : 699}>
                <AllCommentsButton replace to={backPath}>
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
    ) : inSitu ? (
      <Redirect replace to={backPath} />
    ) : (
      <NoSelectedCommentThread />
    )
  }
}
export default connect(mapStateToProps)(SelectedCommentThread)

const Container = styled.div`
  flex: 1;
  max-width: 633px;
  min-width: 370px;
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
