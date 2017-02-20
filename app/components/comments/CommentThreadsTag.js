import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import { openCommentThreads, acceptSelection } from 'redux/actions.js'

function mapStateToProps(state, ownProps) {
  return {
    commentThreads: state.cardsById[ownProps.cardId].commentThreads,
  }
}

const CommentThreadsTag = ({commentThreads, cardId, openCommentThreads,
                            acceptSelection}) =>
  <div
    className="CommentThread__banner"
    onClick={() => {
      openCommentThreads(cardId)
      commentThreads.length === 0 && acceptSelection()
    }}
  >
    { commentThreads.length > 0
      ? <FormattedMessage
        id="comments.nResponses"
        defaultMessage={`{count, number} {count, plural,
          one {response}
          other {responses}
        }`}
        values={{count: commentThreads.length}} />
      : <FormattedMessage id="comments.respond" defaultMessage="Respond" /> }
  </div>

export default connect(
  mapStateToProps,
  {openCommentThreads, acceptSelection}
)(CommentThreadsTag)
