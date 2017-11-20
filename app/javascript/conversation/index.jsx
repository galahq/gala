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
          component={SelectedCommentThread}
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

const NoSelectedCommentThread = styled.div`
  flex: 1;
  max-width: 633px;
  height: calc(100vh - 140px);
  margin: 30px 0 0 36px;
  padding: 30px;
  background-color: #415e77;
  border-radius: 2px;
`
