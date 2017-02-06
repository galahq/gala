import React from 'react'
import { connect } from 'react-redux'

function mapStateToProps(state, ownProps) {
  return {
    commentThreads: state.cardsById[ownProps.cardId].commentThreads,
  }
}

const CommentThreadsTag = ({commentThreads}) =>
  <div className="CommentThread__banner">
    { commentThreads.length > 0
      ? `${commentThreads.length} RESPONSES`
      : `RESPOND` }
  </div>

export default connect(mapStateToProps)(CommentThreadsTag)
