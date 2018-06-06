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

import type { State, ReaderState } from 'redux/state'

type StateProps = { commentable: boolean, kicker: string, reader: ?ReaderState }
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
              <>
                <SelectedCommentThread
                  heightOffset={108}
                  history={history}
                  location={location}
                  match={match}
                />
                <UnselectCommentLink aria-hidden replace to={'/conversation'} />
              </>
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

  &::after {
    box-shadow: inset 0 -10px 10px -5px #02284b11;
    bottom: 0;
    content: '';
    height: 10px;
    left: 0;
    position: absolute;
    width: 100%;
    z-index: 100;
  }
`

const UnselectCommentLink = styled(Link)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`
