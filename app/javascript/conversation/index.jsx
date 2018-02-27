/**
 * @providesModule Conversation
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'

import DocumentTitle from 'react-document-title'
import { Switch, Route, Redirect, Link } from 'react-router-dom'

import RecentCommentThreads from 'conversation/RecentCommentThreads'
import SelectedCommentThread from 'conversation/SelectedCommentThread'
import NoSelectedCommentThread from 'conversation/NoSelectedCommentThread'

import type { State, Reader } from 'redux/state'

type StateProps = { commentable: boolean, kicker: string, reader: ?Reader }
function mapStateToProps ({ caseData }: State): StateProps {
  const { commentable, kicker, reader } = caseData
  return { commentable, kicker, reader }
}

const Conversation = ({ commentable, kicker, intl, reader }) =>
  !commentable || !reader || !reader.enrollment ? (
    <Redirect to="/" />
  ) : (
    <DocumentTitle
      title={`${intl.formatMessage({
        id: 'comments.index.conversation',
      })} — ${kicker} — Gala`}
    >
      <Container>
        <Route component={RecentCommentThreads} />
        <Switch>
          <Route
            path="/conversation/:threadId"
            render={({ history, location, match }) => (
              <React.Fragment>
                <SelectedCommentThread
                  heightOffset={108}
                  history={history}
                  location={location}
                  match={match}
                />
                <UnselectCommentLink aria-hidden replace to={'/conversation'} />
              </React.Fragment>
            )}
          />
          <Route component={NoSelectedCommentThread} />
        </Switch>
      </Container>
    </DocumentTitle>
  )
export default injectIntl(connect(mapStateToProps)(Conversation))

const Container = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 0 1em;
`

const UnselectCommentLink = styled(Link)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`
