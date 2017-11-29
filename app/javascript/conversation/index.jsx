/**
 * @providesModule Conversation
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'

import DocumentTitle from 'react-document-title'
import { Switch, Route } from 'react-router-dom'

import RecentCommentThreads from 'conversation/RecentCommentThreads'
import SelectedCommentThread from 'conversation/SelectedCommentThread'
import { NoSelectedCommentThread } from 'conversation/shared'

import type { State } from 'redux/state'

function mapStateToProps ({ caseData }: State) {
  const { kicker } = caseData
  return {
    kicker,
  }
}

const Conversation = ({ kicker, intl }) => (
  <DocumentTitle
    title={`${intl.formatMessage({
      id: 'conversation',
      defaultMessage: 'Conversation',
    })} — ${kicker} — Gala`}
  >
    <Container>
      <Route component={RecentCommentThreads} />
      <Switch>
        <Route
          path="/conversation/:threadId"
          render={props => (
            <SelectedCommentThread heightOffset={108} {...props} />
          )}
        />
        <Route component={NoSelectedCommentThread} />
      </Switch>
    </Container>
  </DocumentTitle>
)
export default injectIntl(connect(mapStateToProps)(Conversation))

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 0 1em;
`
