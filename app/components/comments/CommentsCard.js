import React from 'react'
import { connect } from 'react-redux'

import { changeCommentInProgress, createComment } from 'redux/actions.js'

function mapStateToProps(state) {
  const threadId = state.ui.selectedCommentThread
  return {
    comments: state.commentThreadsById[threadId]
      .commentIds.map( id => state.commentsById[id] ),
    commentInProgress: state.ui.commentInProgress[threadId] || "",
    threadId,
  }
}

const CommentsCard = ({threadId, comments, commentInProgress,
                       changeCommentInProgress, createComment}) =>
  <aside className="CommentThread scrolling">
    { comments.map( comment => <Comment {...comment} /> ) }
    <form>
      <label htmlFor="CommentSubmit">Cameron Bothner</label><br />
      <div id="CommentSubmit">
        <textarea placeholder="Write a reply..."
          value={commentInProgress}
          onChange={ e => changeCommentInProgress(threadId, e.target.value) } />
        <button onClick={ () => createComment(threadId, commentInProgress) }>
          Submit
        </button>
      </div>
    </form>
  </aside>

export default connect(
  mapStateToProps,
  { changeCommentInProgress, createComment },
)(CommentsCard)

const Comment = ({id, reader, timestamp, content}) =>
  <div className="Comment" key={id} >
    <cite>{reader.name}</cite>
    <i>{timestamp}</i>
    <blockquote>{content}</blockquote>
  </div>
