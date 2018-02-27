/**
 * @providesModule SelectedCommentThread
 * @flow
 */

import * as React from 'react'
import styled, { css } from 'styled-components'
import { connect } from 'react-redux'

import { Link, Redirect } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import { isMobile } from 'react-device-detect'

import LeadComment from 'conversation/LeadComment'
import Responses from 'conversation/Responses'
import ResponseForm, {
  EmptyResponseFormContainer,
} from 'conversation/ResponseForm'
import NoSelectedCommentThread from 'conversation/NoSelectedCommentThread'
import ScrollView from 'utility/ScrollView'
import { LabelForScreenReaders, FocusContainer } from 'utility/A11y'

import { deleteCommentThread } from 'redux/actions'

import type { ContextRouter } from 'react-router-dom'
import type { Dispatch } from 'redux/actions'
import type { State, Reader, Page, Comment } from 'redux/state'

type OwnProps = {|
  ...ContextRouter,
  inSitu?: boolean,
  heightOffset: number,
|}

type StateProps =
  | {|
      commentThreadFound: true,
      activeReader: ?Reader,
      cardPosition: ?number,
      inSituPath: ?string,
      leadComment: ?Comment,
      leadCommenter: { hashKey: string, imageUrl: ?string, name: string },
      originalHighlightText: ?string,
      page: ?Page,
      readerId: number,
      responses: Comment[],
      threadId: string,
    |}
  | {| commentThreadFound: false |}
function mapStateToProps (
  { caseData, commentThreadsById, commentsById, cardsById, pagesById }: State,
  ownProps: OwnProps
): StateProps {
  const threadId = ownProps.match.params.threadId || ''
  const commentThread = commentThreadsById[threadId]
  if (commentThread == null) {
    return { commentThreadFound: false }
  }

  const { reader: activeReader } = caseData
  const { originalHighlightText, cardId, readerId, readers } = commentThread

  const leadCommenter = readers[0] || activeReader
  const comments = commentThread.commentIds.map(id => commentsById[id])
  const leadComment: ?Comment = comments[0]
  const [, ...responses] = comments

  const { position: cardPosition, pageId } =
    cardId != null ? cardsById[cardId] : {}
  const page = pageId != null ? pagesById[pageId] : null
  const inSituPath =
    cardId && page && `/${page.position}/cards/${cardId}/comments/${threadId}`

  return {
    commentThreadFound: true,
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

type DispatchProps = {|
  handleDeleteThread: (SyntheticMouseEvent<*>) => Promise<any>,
|}
function mapDispatchToProps (
  dispatch: Dispatch,
  { match, history, location }: OwnProps
) {
  const id = match.params.threadId || ''
  return {
    handleDeleteThread: (e: SyntheticMouseEvent<*>) => {
      e.preventDefault()
      const promise = dispatch(deleteCommentThread(id))

      const threadIdSuffix = RegExp(`/${id}$`)
      if (threadIdSuffix.test(location.pathname)) {
        history.replace(location.pathname.replace(threadIdSuffix, ''))
      }
      return promise
    },
  }
}

type Props = {| ...OwnProps, ...StateProps, ...DispatchProps |}

class SelectedCommentThread extends React.Component<
  Props,
  { formHeight: number }
> {
  state = { formHeight: 57 }

  scrollView: ?HTMLDivElement

  handleFormResize = (formHeight: number) => this.setState({ formHeight })

  componentDidUpdate (prevProps) {
    if (
      !this.props.commentThreadFound ||
      !prevProps.commentThreadFound ||
      !this.props.activeReader
    ) {
      return
    }
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
    const { inSitu, match, location } = this.props
    const threadId = match.params.threadId || ''
    const backPath = location.pathname.replace(new RegExp(`/${threadId}$`), '')
    if (!this.props.commentThreadFound) {
      return inSitu ? (
        <Redirect replace to={backPath} />
      ) : (
        <NoSelectedCommentThread />
      )
    }

    const {
      cardPosition,
      heightOffset,
      inSituPath,
      handleDeleteThread,
      leadComment,
      leadCommenter,
      originalHighlightText,
      page,
      responses,
    } = this.props
    const { formHeight } = this.state
    return (
      <Container inSitu={inSitu}>
        <FocusContainer priority={2}>
          <ScrollView
            innerRef={scrollView => (this.scrollView = scrollView)}
            maxHeightOffset={`${heightOffset}px + ${
              leadComment == null ? 0 : formHeight
            }px + ${isMobile ? 80 : 0}px`}
          >
            <CommentsContainer>
              <LabelForScreenReaders visibleBelowMaxWidth={inSitu ? 1279 : 699}>
                <AllCommentsButton replace to={backPath}>
                  <FormattedMessage id="comments.index.allComments" />
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
                responseCount={responses.length}
                threadId={threadId}
                onCancel={handleDeleteThread}
              />
              <Responses responses={responses} />
            </CommentsContainer>
          </ScrollView>

          {leadComment != null ? (
            <ResponseForm
              threadId={threadId}
              onResize={this.handleFormResize}
            />
          ) : (
            <EmptyResponseFormContainer />
          )}
        </FocusContainer>
      </Container>
    )
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(
  SelectedCommentThread
)

const Container = styled.div.attrs({ className: 'SelectedCommentThread' })`
  flex: 1;
  max-width: 633px;
  min-width: 370px;
  margin-left: 36px;
  position: relative;
  display: flex;
  flex-direction: column;
  z-index: 1;
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
