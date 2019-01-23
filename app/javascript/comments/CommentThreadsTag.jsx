/**
 * @providesModule CommentThreadsTag
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import { acceptSelection } from 'redux/actions'

import { Link } from 'react-router-dom'

import type { State } from 'redux/state'

type OwnProps = { cardId: string }
function mapStateToProps (
  { cardsById, commentThreadsById }: State,
  { cardId }: OwnProps
) {
  const { commentThreads } = cardsById[cardId]
  if (commentThreads == null) return { count: 0 }

  return {
    count: commentThreads
      .map(e => commentThreadsById[e.id].commentsCount)
      .reduce((a, e) => a + e, 0),
  }
}

const CommentThreadsTag = ({ match, count, cardId, acceptSelection }) => (
  <Link
    replace
    to={`${match.url}/cards/${cardId}/comments`}
    className="CommentThreads__banner"
    onClick={() => {
      count === 0 && acceptSelection()
    }}
  >
    {count > 0 ? (
      <FormattedMessage id="comments.index.nResponses.js" values={{ count }} />
    ) : (
      <FormattedMessage id="comments.new.respond" />
    )}
  </Link>
)

// $FlowFixMe
export default connect(
  mapStateToProps,
  { acceptSelection }
)(CommentThreadsTag)
