/**
 * @providesModule CommentThreadsTag
 *
 */

import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import { acceptSelection } from 'redux/actions'

import TranslatedSpotlight from 'shared/spotlight/TranslatedSpotlight'


function mapStateToProps (
  { cardsById, commentThreadsById },
  { cardId }
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
  <TranslatedSpotlight spotlightKey="comment">
    {({ ref }) => (
      <Link
        replace
        innerRef={ref}
        to={`${match.url}/cards/${cardId}/comments`}
        className="CommentThreads__banner"
        onClick={() => {
          count === 0 && acceptSelection()
        }}
      >
        {count > 0 ? (
          <FormattedMessage
            id="comments.index.nResponses.js"
            values={{ count }}
          />
        ) : (
          <FormattedMessage id="comments.new.respond" />
        )}
      </Link>
    )}
  </TranslatedSpotlight>
)

export default connect(
  mapStateToProps,
  { acceptSelection }
)(CommentThreadsTag)
