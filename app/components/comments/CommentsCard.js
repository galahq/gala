import React from 'react'
import { connect } from 'react-redux'

import { changeCommentInProgress, createComment,
  selectCommentThread } from 'redux/actions.js'

import { injectIntl, FormattedMessage } from 'react-intl'

import Icon from 'Icon.js'

function mapStateToProps(state) {
  const threadId = state.ui.selectedCommentThread
  return {
    comments: state.commentThreadsById[threadId]
      .commentIds.map( id => state.commentsById[id] ),
    commentInProgress: state.ui.commentInProgress[threadId] || "",
    userName: state.caseData.reader.name,
    threadId,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    handleChange: threadId => e => dispatch(
      changeCommentInProgress(threadId, e.target.value)),
    handleSubmit: (threadId, comment) => () => dispatch(
      createComment(threadId, comment)),
    handleBack: () => dispatch(selectCommentThread(null)),
  }
}

const CommentsCard = ({threadId, comments, commentInProgress, intl, userName,
                       handleChange, handleSubmit, handleBack}) =>
  <aside className="CommentThread scrolling">
    <a className="CommentThread__back">
      <Icon className="CommentThread__icon-button" filename="back"
        onClick={handleBack} />
    </a>
    <div>
      { comments.map( comment => <Comment {...comment} key={comment.id} /> ) }
    </div>
    <form style={comments.length === 0 ? { marginTop: 0 } : {}}>
      <label htmlFor="CommentSubmit">{userName}</label><br />
      <div id="CommentSubmit">
        <textarea
          placeholder={intl.formatMessage({
            id: 'comments.write',
            defaultMessage: "Write a reply...",
          })}
          autoFocus
          value={commentInProgress}
          onChange={ handleChange(threadId) } />
        <button type="button"
          onClick={ handleSubmit(threadId, commentInProgress) }>
          <FormattedMessage id="submit" defaultMessage="Submit" />
        </button>
      </div>
    </form>
  </aside>

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(CommentsCard))

const Comment = ({reader, timestamp, content}) =>
  <div className="Comment">
    <cite>{reader.name}</cite>
    <i>{timestamp}</i>
    <blockquote>{content}</blockquote>
  </div>
