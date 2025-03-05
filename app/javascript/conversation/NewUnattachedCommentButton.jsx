/**
 * This is the first row of the sidebar of the conversation view which prompts
 * readers to write a new response. Responses created in the general
 * conversation view are not tied to a specific segment of text, so they are
 * called “unattached.”
 *
 * @providesModule NewUnattachedCommentButton
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { FormattedMessage } from 'react-intl'

import { createUnattachedCommentThread } from 'redux/actions'

import type { ContextRouter } from 'react-router-dom'

type Props = ContextRouter & {
  createUnattachedCommentThread: typeof createUnattachedCommentThread,
}
const NewUnattachedCommentButton = ({
  createUnattachedCommentThread,
  history,
}: Props) => (
  <NewUnattachedButtonContainer>
    <FormattedMessage id="comments.index.joinTheConversation" />
    <button
      className="bp3-button bp3-intent-primary bp3-icon-annotation"
      onClick={() =>
        createUnattachedCommentThread().then(id =>
          history.push(`/conversation/${id}`)
        )
      }
    >
      <FormattedMessage id="comments.new.writeNew" />
    </button>
  </NewUnattachedButtonContainer>
)

export default connect(
  null,
  {
    createUnattachedCommentThread,
  }
)(withRouter(NewUnattachedCommentButton))

const NewUnattachedButtonContainer = styled.div`
  padding: 14px 18px;
  background-color: #dddcd6;
  mix-blend-mode: darken;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid #bfbdac;
`
