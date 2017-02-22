import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import { openCommentThreads, acceptSelection } from 'redux/actions.js'

function mapStateToProps(state, ownProps) {
  return {
    count: state.cardsById[ownProps.cardId].commentThreads
      .map( e => state.commentThreadsById[e.id].commentIds )
      .reduce( (a, e) => [...a, ...e], [] )
      .length,
  }
}

const CommentThreadsTag = ({count, cardId, openCommentThreads,
                            acceptSelection}) =>
  <div
    className="CommentThread__banner"
    onClick={() => {
      openCommentThreads(cardId)
      count === 0 && acceptSelection()
    }}
  >
    { count > 0
      ? <FormattedMessage
        id="comments.nResponses"
        defaultMessage={`{count, number} {count, plural,
          one {response}
          other {responses}
        }`}
        values={{count}} />
      : <FormattedMessage id="comments.respond" defaultMessage="Respond" /> }
  </div>

export default connect(
  mapStateToProps,
  {openCommentThreads, acceptSelection}
)(CommentThreadsTag)
