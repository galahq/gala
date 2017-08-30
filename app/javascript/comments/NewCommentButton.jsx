/**
 * @providesModule NewCommentButton
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'

import { FormattedMessage } from 'react-intl'
import { Tooltip, Position } from '@blueprintjs/core'
import { EditorState } from 'draft-js'

import CommunityChooser from 'overview/CommunityChooser'

import { acceptSelection } from 'redux/actions'

import type { State } from 'redux/state'

type OwnProps = { cardId: string }

function mapStateToProps (state: State, { cardId }: OwnProps) {
  const editorState =
    state.cardsById[cardId].editorState || EditorState.createEmpty()

  return {
    acceptingSelection: state.ui.acceptingSelection,
    selectionPending: !editorState.getSelection().isCollapsed(),
  }
}

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
  <Tooltip
    position={Position.BOTTOM}
    portalClassName="NewCommentButton__CommunityChooser"
    isOpen={acceptingSelection && selectionPending}
    content={<CommunityChooser white disabled />}
  >
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
  </Tooltip>
)

export default connect(mapStateToProps, { acceptSelection })(NewCommentButton)
