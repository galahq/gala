import React from 'react'
import { connect } from 'react-redux'

import { changeCommentInProgress, createComment } from 'redux/actions'

import { injectIntl, FormattedMessage } from 'react-intl'

import { styles } from 'card/draftConfig'

import { Link, matchPath } from 'react-router-dom'
import { commentThreadsOpen } from 'shared/routes'

import Icon from 'utility/Icon'

import type { State, Reader } from 'redux/state'

type OwnProps = { match: { params: { commentThreadId: string }}}
function mapStateToProps (state: State, { match }: OwnProps) {
  const threadId = match.params.commentThreadId
  const thread = state.commentThreadsById[threadId]
  return {
    comments: thread.commentIds.map(id => state.commentsById[id]),
    originalHighlightText: thread.originalHighlightText,
    commentInProgress: state.ui.commentInProgress[threadId] || '',
    userName: state.caseData.reader.name,
    threadId,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    handleChange: threadId => e => dispatch(
      changeCommentInProgress(threadId, e.target.value)),
    handleSubmit: (threadId, comment) => () => dispatch(
      createComment(threadId, comment)),
  }
}

const CommentsCard = ({
  threadId,
  comments,
  commentInProgress,
  intl,
  userName,
  originalHighlightText,
  handleChange,
  handleSubmit,
  location,
}) => (
  <aside className="CommentThread scrolling">
    <Link
      replace
      to={matchPath(location.pathname, commentThreadsOpen()).url}
      className="CommentThread__back"
    >
      <Icon className="CommentThread__icon-button" filename="back" />
    </Link>

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
      { comments.map(comment => <Comment {...comment} key={comment.id} />) }
    </div>

    <form style={comments.length === 0 ? { marginTop: 0 } : {}}>
      <label htmlFor="CommentSubmit">{userName}</label><br />
      <div id="CommentSubmit">
        <textarea
          className="pt-input"
          placeholder={intl.formatMessage({
            id: 'comments.write',
            defaultMessage: 'Write a reply...',
          })}
          value={commentInProgress}
          onKeyDown={ e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(threadId, commentInProgress)()
            }
          }}
          onChange={ handleChange(threadId) }
        />
        <button
          type="button"
          className="pt-button pt-intent-primary CommentThread__submit-button"
          onClick={ handleSubmit(threadId, commentInProgress) }
        >
          <FormattedMessage id="submit" defaultMessage="Submit" />
        </button>
      </div>
    </form>
  </aside>
)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(CommentsCard))

type CommentProps = { reader: Reader, timestamp: string, content: string}
const Comment = ({ reader, timestamp, content }: CommentProps) =>
  <div className="Comment">
    <cite>{reader.name}</cite>
    <i>{timestamp}</i>
    <blockquote>{content}</blockquote>
  </div>
