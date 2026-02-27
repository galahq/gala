/**
 * @providesModule SelectedCommentThread
 * @flow
 */

import React, { useRef, useState, useEffect, useCallback } from 'react'
import styled, { css } from 'styled-components'
import { connect } from 'react-redux'

import { Link, Redirect } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import { isMobile } from 'react-device-detect'

import LeadCommenter from 'conversation/LeadCommenter'
import CommentThreadLocation from 'conversation/CommentThreadLocation'
import LeadComment from 'conversation/LeadComment'
import FirstPostForm from 'conversation/FirstPostForm'
import Responses from 'conversation/Responses'
import ResponseForm, {
  EmptyResponseFormContainer,
} from 'conversation/ResponseForm'
import NoSelectedCommentThread from 'conversation/NoSelectedCommentThread'
import ScrollView from 'utility/ScrollView'
import { LabelForScreenReaders, FocusContainer } from 'utility/A11y'

import { deleteCommentThread } from 'redux/actions'
import usePrevious from 'utility/hooks/usePrevious'

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
      detached: boolean,
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
export function mapStateToProps (
  { caseData, commentThreadsById, commentsById, cardsById, pagesById }: State,
  ownProps: OwnProps
) {
  const threadId = ownProps.match.params.threadId || ''
  const commentThread = commentThreadsById[threadId]
  if (commentThread == null) {
    return { commentThreadFound: false }
  }

  const { reader: activeReader } = caseData
  const { originalHighlightText, cardId, readerId, readers } = commentThread

  const leadCommenter = readers[0] || activeReader
  const comments = commentThread.commentIds
    .map(id => commentsById[id])
    .filter(Boolean)
  const leadComment: ?Comment = comments[0]
  const [, ...responses] = comments

  const { position: cardPosition, pageId } =
    cardId != null ? cardsById[cardId] : {}
  const page = pageId != null ? pagesById[pageId] : null
  const inSituPath =
    cardId && page && `/${page.position}/cards/${cardId}/comments/${threadId}`
  const detached =
    commentThread.start == null || commentThread.blockIndex == null

  return {
    commentThreadFound: true,
    activeReader,
    cardPosition,
    detached,
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

function SelectedCommentThread (props: Props) {
  const [formHeight, setFormHeight] = useState(57)
  const scrollViewRef = useRef<HTMLDivElement>(null)

  const prevProps = usePrevious(props)

  function activeReaderJustCommented () {
    // Guard for type refinement
    if (
      !props.commentThreadFound ||
      !prevProps ||
      !prevProps.commentThreadFound ||
      !props.activeReader
    ) {
      return false
    }

    const { threadId, responses, activeReader } = props

    const sameThread = prevProps.threadId === threadId
    const addingResponse = prevProps.responses.length < responses.length
    const activeReaderCommentedLast =
      responses[responses.length - 1]?.reader.id === activeReader.id

    return sameThread && addingResponse && activeReaderCommentedLast
  }

  useEffect(() => {
    if (activeReaderJustCommented() && scrollViewRef.current != null) {
      scrollViewRef.current.scrollTop = scrollViewRef.current.scrollHeight
    }
  })

  // $FlowFixMe
  const handleFormResize = useCallback((height: number) => {
    setFormHeight(height)
  }, [])

  const { inSitu, match, location } = props
  const threadId = match.params.threadId || ''
  const backPath = location.pathname.replace(new RegExp(`/${threadId}$`), '')

  if (!props.commentThreadFound) {
    return inSitu ? (
      <Redirect replace to={backPath} />
    ) : (
      <NoSelectedCommentThread />
    )
  }

  const {
    cardPosition,
    detached,
    handleDeleteThread,
    heightOffset,
    inSituPath,
    leadComment,
    leadCommenter,
    originalHighlightText,
    page,
    responses,
  } = props

  return (
    <Container inSitu={inSitu}>
      <FocusContainer priority={2}>
        <ScrollView
          innerRef={el => (scrollViewRef.current = el || null)}
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

            <LeadCommenter reader={leadCommenter} />
            <CommentThreadLocation
              cardPosition={cardPosition}
              detached={detached}
              inSitu={inSitu}
              inSituPath={inSituPath}
              originalHighlightText={originalHighlightText}
              page={page}
            />

            {leadComment ? (
              <>
                <LeadComment
                  leadComment={leadComment}
                  responseCount={responses.length}
                  onCancel={handleDeleteThread}
                />
                <Responses responses={responses} />
              </>
            ) : (
              <FirstPostForm
                key="3"
                threadId={threadId}
                onCancel={handleDeleteThread}
              />
            )}
          </CommentsContainer>
        </ScrollView>

        {leadComment != null ? (
          <ResponseForm threadId={threadId} onResize={handleFormResize} />
        ) : (
          <EmptyResponseFormContainer />
        )}
      </FocusContainer>
    </Container>
  )
}

// $FlowFixMe
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SelectedCommentThread)

const Container = styled.div.attrs({ 'data-testid': 'SelectedCommentThread' })`
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
