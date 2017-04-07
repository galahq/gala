import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import { acceptSelection } from 'redux/actions'

import { Link } from 'react-router-dom'

import type { State } from 'redux/state'

type OwnProps = { cardId: string }
function mapStateToProps (state: State, ownProps: OwnProps) {
  return {
    count: state.cardsById[ownProps.cardId].commentThreads
      .map(e => state.commentThreadsById[e.id].commentIds)
      .reduce((a, e) => [...a, ...e], [])
      .length,
  }
}

const CommentThreadsTag = ({ match, count, cardId, acceptSelection }) =>
  <Link
    replace
    to={`${match.url}/cards/${cardId}/comments`}
    className="CommentThreads__banner"
    onClick={() => {
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
        values={{ count }} />
      : <FormattedMessage id="comments.respond" defaultMessage="Respond" /> }
  </Link>

export default connect(
  mapStateToProps,
  { acceptSelection }
)(CommentThreadsTag)
