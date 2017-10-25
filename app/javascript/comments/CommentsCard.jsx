/**
 * @providesModule CommentsCard
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { changeCommentInProgress, createComment } from 'redux/actions'

import { injectIntl, FormattedMessage } from 'react-intl'

import { styles } from 'card/draftConfig'

import { Link, matchPath } from 'react-router-dom'
import { commentThreadsOpen } from 'shared/routes'

import Comment from 'comments/Comment'
import Icon from 'utility/Icon'

import type { ContextRouter } from 'react-router-dom'
import type { State } from 'redux/state'
import type { Dispatch } from 'redux/actions'

type OwnProps = {
  ...ContextRouter,
  match: { params: { commentThreadId: string } },
}
function mapStateToProps (
  { commentThreadsById, commentsById, ui, caseData }: State,
  { location, match }: OwnProps
) {
  const threadId = match.params.commentThreadId
  const thread = commentThreadsById[threadId]
  return {
    comments: thread.commentIds.map(id => commentsById[id]),
    originalHighlightText: thread.originalHighlightText,
    commentInProgress: ui.commentInProgress[threadId] || '',
    userName: caseData.reader ? caseData.reader.name : '',
    threadDetached: thread.start == null || thread.blockIndex == null,
    readerIsModerator: caseData.reader && caseData.reader.canUpdateCase,
    location,
    threadId,
  }
}

function mapDispatchToProps (dispatch: Dispatch) {
  return {
    handleChange: (threadId: string) => (e: SyntheticInputEvent<*>) =>
      dispatch(changeCommentInProgress(threadId, e.target.value)),
    handleSubmit: (threadId: string, comment: string) => () =>
      dispatch(createComment(threadId, comment)),
  }
}

const CommentsCard = ({
  threadId,
  comments,
  commentInProgress,
  intl,
  userName,
  originalHighlightText,
  threadDetached,
  readerIsModerator,
  handleChange,
  handleSubmit,
  location,
}) => (
  <aside className="CommentThread scrolling">
    <Link
      replace
      to={(matchPath(location.pathname, commentThreadsOpen()) || {}).url}
      className="CommentThread__back"
    >
      <Icon className="CommentThread__icon-button" filename="back" />
    </Link>

    {threadDetached && (
      <Callout>
        <FormattedMessage
          id="comment.textChanged"
          defaultMessage="The text being discussed has changed since this conversation started."
        />
      </Callout>
    )}

    <div className="CommentThread__metadata">
      <div className="CommentThread__metadata__label">Comments on</div>
      <span
        className="CommentThread__metadata__text"
        style={styles.purpleHighlight}
      >
        {originalHighlightText}
      </span>
    </div>

    <div style={{ flex: 1, overflow: 'scroll' }}>
      {comments.map(comment => <Comment {...comment} key={comment.id} />)}
    </div>

    <form style={comments.length === 0 ? { marginTop: 0 } : {}}>
      <label htmlFor="CommentSubmit">{userName}</label>
      <br />
      <div id="CommentSubmit">
        <textarea
          className="pt-input"
          placeholder={intl.formatMessage({
            id: 'comments.write',
            defaultMessage: 'Write a reply...',
          })}
          value={commentInProgress}
          onKeyDown={(e: SyntheticKeyboardEvent<*>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(threadId, commentInProgress)()
            }
          }}
          onChange={handleChange(threadId)}
        />
        <button
          type="button"
          className="pt-button pt-intent-primary CommentThread__submit-button"
          onClick={handleSubmit(threadId, commentInProgress)}
        >
          <FormattedMessage id="submit" defaultMessage="Submit" />
        </button>
      </div>
    </form>
  </aside>
)

export default connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(CommentsCard)
)

const Callout = styled.div.attrs({ className: 'pt-callout pt-icon-error' })`
  line-height: 1.3;
  font-weight: 400;
  margin-bottom: 1em;
`
