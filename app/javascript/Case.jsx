/**
 * @providesModule Case
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import DocumentTitle from 'react-document-title'

import {
  parseAllCards,
  fetchCommentThreads,
  registerToaster,
  addComment,
  addCommentThread,
  handleNotification,
} from 'redux/actions.js'

import StatusBar from 'overview/StatusBar'
import CaseOverview from 'overview/CaseOverview'
import CaseElement from 'elements/CaseElement'
import PreTest from 'quiz/PreTest'
import PostTest from 'quiz/PostTest'

import { Toaster } from '@blueprintjs/core'

import type { State } from 'redux/state'

class Case extends React.Component {
  _subscribe = () => {
    // $FlowFixMe
    if (typeof App === 'undefined') return
    // eslint-disable-next-line
    App.forum = App.cable.subscriptions.create('ForumChannel', {
      received: data => {
        if (data.comment) {
          this.props.addComment(JSON.parse(data.comment))
        }
        if (data.comment_thread) {
          this.props.addCommentThread(JSON.parse(data.comment_thread))
        }
      },
    })

    // eslint-disable-next-line
    App.readerNotification = App.cable.subscriptions.create(
      'ReaderNotificationsChannel',
      {
        received: data => {
          this.props.handleNotification(JSON.parse(data.notification))
        },
      }
    )
  }

  componentDidMount () {
    const {
      parseAllCards,
      loadComments,
      caseSlug,
      fetchCommentThreads,
      registerToaster,
    } = this.props

    parseAllCards()
    if (loadComments) fetchCommentThreads(caseSlug)

    registerToaster(Toaster.create())

    this._subscribe()
  }

  render () {
    const { kicker, basename, needsPretest, needsPosttest } = this.props
    return (
      <DocumentTitle title={`${kicker} — Michigan Sustainability Cases`}>
        <div id="Case">
          <StatusBar />
          <Router basename={basename}>
            <Switch>
              <Route exact path="/" component={CaseOverview} />
              <Route path={needsPretest ? '/*' : 'miss'} component={PreTest} />
              <Route
                path={needsPosttest ? '/quiz/' : 'miss'}
                component={PostTest}
              />
              <Route path="/:position/" component={CaseElement} />
            </Switch>
          </Router>
        </div>
      </DocumentTitle>
    )
  }
}

export default connect(
  ({ quiz, caseData }: State) => ({
    needsPretest: quiz.needsPretest,
    needsPosttest: quiz.needsPosttest,
    caseSlug: caseData.slug,
    kicker: caseData.kicker,
    loadComments:
      caseData.commentable && caseData.reader && caseData.reader.enrollment,
    basename: location.pathname.replace(
      RegExp(`${caseData.slug}.*`),
      caseData.slug
    ),
  }),
  {
    parseAllCards,
    fetchCommentThreads,
    registerToaster,
    addComment,
    addCommentThread,
    handleNotification,
  }
)(Case)
