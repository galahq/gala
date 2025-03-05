/**
 * @providesModule NewCommentButton
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { FormattedMessage } from 'react-intl'
import { Button, Tooltip, Position, Intent } from '@blueprintjs/core'
import { EditorState } from 'draft-js'

import CommunityChooser from 'overview/CommunityChooser'

import { acceptSelection } from 'redux/actions'
import { getSelectionText, getParagraphs } from 'shared/draftHelpers'

import type { State } from 'redux/state'

type OwnProps = { cardId: string }

function mapStateToProps (state: State, { cardId }: OwnProps) {
  const editorState =
    state.cardsById[cardId].editorState || EditorState.createEmpty()

  return {
    acceptingSelection: state.ui.acceptingSelection,
    selectionPending: !editorState.getSelection().isCollapsed(),
    selectionNotUnique: selectionNotUnique(editorState),
  }
}

type Props = {
  acceptingSelection: boolean,
  selectionPending: boolean,
  selectionNotUnique: boolean,
  addCommentThread: () => Promise<void>,
  acceptSelection: typeof acceptSelection,
}

const NewCommentButton = ({
  acceptingSelection,
  selectionPending,
  selectionNotUnique,
  addCommentThread,
  acceptSelection,
}: Props) => (
  <Container>
    <FlexTooltip
      position={Position.BOTTOM}
      intent={selectionNotUnique ? Intent.DANGER : undefined}
      portalClassName="NewCommentButton__CommunityChooser"
      isOpen={acceptingSelection && selectionPending}
      content={
        selectionNotUnique ? (
          <UniquenessWarning />
        ) : (
          <CommunityChooser rounded disabled />
        )
      }
    >
      <StyledButton
        icon={
          !acceptingSelection
            ? 'edit'
            : !selectionPending
            ? 'text-highlight'
            : 'manually-entered-data'
        }
        disabled={
          (acceptingSelection && !selectionPending) || selectionNotUnique
        }
        onClick={acceptingSelection ? addCommentThread : acceptSelection}
      >
        {!acceptingSelection ? (
          <FormattedMessage id="comments.new.writeNew" />
        ) : !selectionPending ? (
          <FormattedMessage id="comments.new.select" />
        ) : (
          <FormattedMessage id="comments.new.respondHere" />
        )}
      </StyledButton>
    </FlexTooltip>

    {acceptingSelection && !selectionPending && (
      <CancelButton onClick={() => acceptSelection(false)}>
        <FormattedMessage id="helpers.cancel" />
      </CancelButton>
    )}
  </Container>
)

// $FlowFixMe
export default connect(
  mapStateToProps,
  { acceptSelection }
)(NewCommentButton)

const UniquenessWarning = () => (
  <div style={{ padding: '6px 12px' }}>
    <FormattedMessage id="comments.new.selectionNotUnique" />
  </div>
)

function selectionNotUnique (editorState: EditorState): boolean {
  const selection = getSelectionText(editorState)
  if (selection === '') return false

  const card = getParagraphs(editorState).join('\n----->8-----\n')
  return card.split(selection).length > 2
}

const Container = styled.div.attrs({ className: 'bp3-dark' })`
  display: flex;
  width: 100%;
  @media (max-width: 513px) {
    .accepting-selection & {
      position: fixed;
      top: -7px;
      left: 0px;
      width: 100%;
      padding: 60px 6px 6px;
      background-color: #493092;
      border-bottom: 1px solid #351d7a;
      border-radius: 7px;
    }
  }
`

const FlexTooltip = styled(Tooltip)`
  flex: 1;
`

const StyledButton = styled(Button).attrs({
  className: 'bp3-intent-primary bp3-fill',
})`
  font-size: 11pt;
  color: white;
  &:hover,
  &:focus {
    background-color: #493092;
  }
  &:disabled {
    cursor: initial;
    background-color: transparent;
    color: rgba(253, 253, 250, 1) !important;
  }
`

const CancelButton = styled(Button)`
  margin-left: 6px;
`
