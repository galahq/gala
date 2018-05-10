/**
 * @providesModule Case
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import DocumentTitle from 'react-document-title'

import {
  parseAllCards,
  fetchCommentThreads,
  fetchCommunities,
  registerToaster,
  toggleEditing,
  subscribeToActiveForumChannel,
  handleNotification,
} from 'redux/actions'

import asyncComponent from 'utility/asyncComponent'

import StatusBar from 'overview/StatusBar'
import CaseOverview from 'overview/CaseOverview'

// import { Toaster } from '@blueprintjs/core'
import hackIntoReactAndCreateAToasterBecauseBlueprintDoesntSupportFiberYet from 'shared/badTerribleAwfulCode'

import type { State } from 'redux/state'

const CaseElement = asyncComponent(() =>
  import('elements/CaseElement').then(m => m.default)
)
const PreTest = asyncComponent(() =>
  import('quiz/PreTest').then(m => m.default)
)
const PostTest = asyncComponent(() =>
  import('quiz/PostTest').then(m => m.default)
)
const Conversation = asyncComponent(() =>
  import('conversation').then(m => m.default)
)

function mapStateToProps ({ quiz, caseData }: State) {
  return {
    needsPretest: quiz.needsPretest,
    hasQuiz: !!quiz.questions && quiz.questions.length > 0,
    caseSlug: caseData.slug,
    kicker: caseData.kicker,
    loadComments: !!(
      caseData.commentable &&
      caseData.reader &&
      caseData.reader.enrollment
    ),
    basename: location.pathname.replace(
      RegExp(`${caseData.slug}.*`),
      caseData.slug
    ),
    editable: caseData.reader && caseData.reader.canUpdateCase,
  }
}

class Case extends React.Component<{
  needsPretest: boolean,
  hasQuiz: boolean,
  caseSlug: string,
  kicker: string,
  loadComments: boolean,
  basename: string,
  parseAllCards: typeof parseAllCards,
  fetchCommentThreads: typeof fetchCommentThreads,
  fetchCommunities: typeof fetchCommunities,
  toggleEditing: typeof toggleEditing,
  registerToaster: typeof registerToaster,
  subscribeToActiveForumChannel: typeof subscribeToActiveForumChannel,
  handleNotification: typeof handleNotification,
  editable: ?boolean,
}> {
  _subscribe = () => {
    if (typeof App === 'undefined' || !('WebSocket' in window)) return

    const {
      handleNotification,
      subscribeToActiveForumChannel,
      caseSlug,
    } = this.props

    App.readerNotification = App.cable.subscriptions.create(
      'ReaderNotificationsChannel',
      {
        received: data => {
          handleNotification(JSON.parse(data.notification))
        },
      }
    )

    subscribeToActiveForumChannel(caseSlug)
  }

  componentDidMount () {
    const {
      parseAllCards,
      loadComments,
      caseSlug,
      fetchCommentThreads,
      fetchCommunities,
      toggleEditing,
      registerToaster,
    } = this.props

    parseAllCards()

    if (loadComments) {
      fetchCommentThreads(caseSlug)
      fetchCommunities(caseSlug)
    }

    if (this._shouldStartInEditMode()) {
      toggleEditing()
    }

    // registerToaster(Toaster.create())
    hackIntoReactAndCreateAToasterBecauseBlueprintDoesntSupportFiberYet(
      toaster => registerToaster(toaster)
    )

    this._subscribe()
  }

  render () {
    const { kicker, basename, needsPretest, hasQuiz } = this.props
    return (
      <DocumentTitle title={`${kicker} — Gala`}>
        <Router basename={basename}>
          <div id="Case">
            <StatusBar />
            <Switch>
              <Route exact path="/" component={CaseOverview} />
              <Route path={needsPretest ? '/*' : 'miss'} component={PreTest} />
              <Route path={hasQuiz ? '/quiz/' : 'miss'} component={PostTest} />
              <Route path="/conversation" component={Conversation} />
              <Route path="/:position/" component={CaseElement} />
            </Switch>
          </div>
        </Router>
      </DocumentTitle>
    )
  }

  _shouldStartInEditMode (): boolean {
    if (!this.props.editable) return false
    if (URLSearchParams == null) return false

    const { search } = window.location
    const params = new URLSearchParams(search.substring(0)) // remove leading '?'
    return params.has('edit')
  }
}

export default connect(mapStateToProps, {
  parseAllCards,
  fetchCommentThreads,
  fetchCommunities,
  toggleEditing,
  registerToaster,
  subscribeToActiveForumChannel,
  handleNotification,
})(Case)
