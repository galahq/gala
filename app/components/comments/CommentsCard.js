import React from 'react'
import { connect } from 'react-redux'

function mapStateToProps(state) {
  return {
    comments: state.commentThreadsById[state.ui.selectedCommentThread]
      .commentIds.map( id => state.commentsById[id] ),
  }
}

const CommentsCard = ({comments}) =>
  <aside className="CommentThread scrolling">
    { comments.map( comment => <Comment {...comment} /> ) }
    <form>
      <label htmlFor="CommentSubmit">Cameron Bothner</label><br />
      <div id="CommentSubmit">
        <textarea placeholder="Write a reply..." />
        <button type="submit">Submit</button>
      </div>
    </form>
  </aside>

export default connect(mapStateToProps)(CommentsCard)

const Comment = ({id, reader, timestamp, content}) =>
  <div className="Comment" key={id} >
    <cite>{reader.name}</cite>
    <i>{timestamp}</i>
    <blockquote>{content}</blockquote>
  </div>
