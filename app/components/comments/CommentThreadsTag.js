import React from 'react'
import { connect } from 'react-redux'

import { openComments } from 'redux/actions.js'

function mapStateToProps(state, ownProps) {
  return {
    commentThreads: state.cardsById[ownProps.cardId].commentThreads,
  }
}

const CommentThreadsTag = ({commentThreads, cardId, openComments}) =>
  <div className="CommentThread__banner" onClick={() => openComments(cardId)}>
    { commentThreads.length > 0
      ? `${commentThreads.length} RESPONSES`
      : `RESPOND` }
  </div>

export default connect(mapStateToProps, {openComments})(CommentThreadsTag)
