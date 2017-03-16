import React from 'react';
import { connect } from 'react-redux'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import { parseAllCards, registerToaster, addComment,
  addCommentThread } from 'redux/actions.js'

import StatusBar from 'StatusBar.js'
import CaseOverview from 'CaseOverview.js'
import CaseElement from 'CaseElement.js'

import { Toaster } from '@blueprintjs/core'

class Case extends React.Component {
  constructor(props) {
    super(props)

    this._subscribe = () => {
      if (typeof App === 'undefined')  return

      App.forum = App.cable.subscriptions  // eslint-disable-line
        .create("ForumChannel", {
          connected: () => {},
          disconnected: () => {},
          received: data => {
            if (data.comment)
              this.props.addComment(JSON.parse(data.comment))
            if (data.comment_thread)
              this.props.addCommentThread(JSON.parse(data.comment_thread))
          },
        })
    }

  }

  componentDidMount() {
    setTimeout( () => this.props.parseAllCards(), 1 )

    this.props.registerToaster(Toaster.create())

    this._subscribe()
  }

  render() {
    return (
      <div id="Case">
        <StatusBar />
        <Router basename={`/cases/${this.props.slug}`}>
          <Switch>
            <Route path="/" exact component={CaseOverview} />
            <Route path="/:position" component={CaseElement} />
          </Switch>
        </Router>
      </div>
    )
  }
}

export default connect(
  (state) => ({slug: state.caseData.slug}),
  { parseAllCards, registerToaster, addComment, addCommentThread },
)(Case)
