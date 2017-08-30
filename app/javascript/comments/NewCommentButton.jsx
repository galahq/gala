/**
 * @providesModule NewCommentButton
 * @flow
 */

import React from 'react'

import { acceptSelection } from 'redux/actions'

import { FormattedMessage } from 'react-intl'

type Props = {
  acceptingSelection: boolean,
  selectionPending: boolean,
  addCommentThread: () => Promise<void>,
  acceptSelection: typeof acceptSelection,
}

const NewCommentButton = ({
  acceptingSelection,
  selectionPending,
  addCommentThread,
  acceptSelection,
}: Props) => (
  <button
    className="o-button CommentThreads__new-button"
    disabled={acceptingSelection && !selectionPending}
    onClick={acceptingSelection ? addCommentThread : acceptSelection}
  >
    {!acceptingSelection ? (
      <FormattedMessage
        id="comments.writeNew"
        defaultMessage="Write a new response"
      />
    ) : !selectionPending ? (
      <FormattedMessage
        id="comments.select"
        defaultMessage="Select a few words"
      />
    ) : (
      <FormattedMessage id="comments.here" defaultMessage="Respond here" />
    )}
  </button>
)

export default NewCommentButton
