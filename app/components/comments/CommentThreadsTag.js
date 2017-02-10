import React from 'react'
import { connect } from 'react-redux'

import { openCommentThreads } from 'redux/actions.js'

function mapStateToProps(state, ownProps) {
  return {
    commentThreads: state.cardsById[ownProps.cardId].commentThreads,
  }
}

const CommentThreadsTag = ({commentThreads, cardId, openCommentThreads}) =>
  <div
    className="CommentThread__banner"
    onClick={() => openCommentThreads(cardId)}
  >
    { commentThreads.length > 0
      ? `${commentThreads.length} RESPONSE${
                                      commentThreads.length  === 1 ? "" : 'S'}`
      : `RESPOND` }
  </div>

export default connect(mapStateToProps, {openCommentThreads})(CommentThreadsTag)
