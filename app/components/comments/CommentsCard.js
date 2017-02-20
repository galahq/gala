import React from 'react'
import { connect } from 'react-redux'

import { changeCommentInProgress, createComment } from 'redux/actions.js'

import { injectIntl, FormattedMessage } from 'react-intl'

function mapStateToProps(state) {
  const threadId = state.ui.selectedCommentThread
  return {
    comments: state.commentThreadsById[threadId]
      .commentIds.map( id => state.commentsById[id] ),
    commentInProgress: state.ui.commentInProgress[threadId] || "",
    threadId,
  }
}

const CommentsCard = ({threadId, comments, commentInProgress, intl,
                       changeCommentInProgress, createComment}) =>
  <aside className="CommentThread scrolling">
    { comments.map( comment => <Comment {...comment} /> ) }
    <form style={comments.length === 0 ? { marginTop: 0 } : {}}>
      <label htmlFor="CommentSubmit">Cameron Bothner</label><br />
      <div id="CommentSubmit">
        <textarea
          placeholder={intl.formatMessage({
            id: 'comments.write',
            defaultMessage: "Write a reply...",
          })}
          autoFocus
          value={commentInProgress}
          onChange={ e => changeCommentInProgress(threadId, e.target.value) } />
        <button type="button"
          onClick={ () => createComment(threadId, commentInProgress) }>
          <FormattedMessage id="submit" defaultMessage="Submit" />
        </button>
      </div>
    </form>
  </aside>

export default connect(
  mapStateToProps,
  { changeCommentInProgress, createComment },
)(injectIntl(CommentsCard))

const Comment = ({id, reader, timestamp, content}) =>
  <div className="Comment" key={id} >
    <cite>{reader.name}</cite>
    <i>{timestamp}</i>
    <blockquote>{content}</blockquote>
  </div>
