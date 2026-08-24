/**
 * This is the first row of the sidebar of the conversation view which prompts
 * readers to write a new response. Responses created in the general
 * conversation view are not tied to a specific segment of text, so they are
 * called “unattached.”
 *
 * @providesModule NewUnattachedCommentButton
 * 
 */

import * as React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { FormattedMessage } from 'react-intl'

import { createUnattachedCommentThread } from 'redux/actions'


const NewUnattachedCommentButton = ({
  createUnattachedCommentThread,
  history,
}) => (
  <NewUnattachedButtonContainer>
    <FormattedMessage id="comments.index.joinTheConversation" />
    <button
      className="bp6-button bp6-intent-primary bp6-icon-annotation"
      onClick={() =>
        createUnattachedCommentThread().then(id =>
          id ? history.push(`/conversation/${id}`) : null
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
