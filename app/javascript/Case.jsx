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
  registerToaster,
  addComment,
  addCommentThread,
  handleNotification,
} from 'redux/actions.js'

import StatusBar from 'overview/StatusBar'
import CaseOverview from 'overview/CaseOverview'
import CaseElement from 'elements/CaseElement'
import PreTest from 'quiz/PreTest'

import { Toaster } from '@blueprintjs/core'

import type { State } from 'redux/state'

class Case extends React.Component {
  constructor (props) {
    super(props)

    this._subscribe = () => {
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
  }

  componentDidMount () {
    setTimeout(() => this.props.parseAllCards(), 1)

    this.props.registerToaster(Toaster.create())

    this._subscribe()
  }

  render () {
    return (
      <DocumentTitle
        title={`${this.props.kicker} — Michigan Sustainability Cases`}
      >
        <div id="Case">
          <StatusBar />
          <Router basename={this.props.basename}>
            <Switch>
              <Route exact path="/" component={CaseOverview} />
              {this.props.needsPretest &&
                <Route
                  path="/*"
                  children={routeProps =>
                    routeProps.match && <PreTest {...routeProps} />}
                />}
              <Route path="/:position/" component={CaseElement} />
            </Switch>
          </Router>
        </div>
      </DocumentTitle>
    )
  }
}

export default connect(
  (state: State) => ({
    needsPretest: state.quiz.needsPretest,
    kicker: state.caseData.kicker,
    basename: location.pathname.replace(
      RegExp(`${state.caseData.slug}.*`),
      state.caseData.slug
    ),
  }),
  {
    parseAllCards,
    registerToaster,
    addComment,
    addCommentThread,
    handleNotification,
  }
)(Case)
