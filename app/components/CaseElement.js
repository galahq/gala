import React from 'react'
import { connect } from 'react-redux'
import { Redirect, Link } from 'react-router-dom'

import Sidebar from 'Sidebar.js'
import Page from 'Page.js'
import Podcast from 'Podcast.js'
import ActivityOverview from 'TableOfContents.js'

import { FormattedMessage } from 'react-intl'

function mapStateToProps(state, {match}) {
  const position = parseInt(match.params.position, 10) - 1
  const uri = state.caseData.caseElements[position]
  if (!uri)  return {}

  const [model, idString] = uri.split('/')

  const next = state.caseData.caseElements[position + 1]
  const [nextModel, nextId] = next ? next.split('/') : []

  return {
    editing: state.edit.inProgress,
    next: next && {
      title: state[`${nextModel}ById`][nextId].title,
      position: next && (position + 2),
    },
    id: parseInt(idString, 10),
    model,
  }
}

const CaseElement = ({editing, model, id, next}) => {
  var child
  switch (model) {
    case undefined: return <Redirect to="/" />
    case 'pages': child = <Page id={id} />; break
    case 'podcasts': child = <Podcast id={id} />; break
    case 'activities': child = <ActivityOverview activityId={id} />; break
  }

  return <div className={`window ${editing && 'editing'}`}>
    <Sidebar />
    <main>
      <a id="top" />

      { child }

      <NextLink next={next} />
    </main>
  </div>
}

export default connect(mapStateToProps)(CaseElement)


const NextLink = ({next}) => next
  ? <Link className="nextLink" to={`/${next.position}`}>
    <FormattedMessage id="case.next" />
    {next.title}
  </Link>
  : <footer>
    <h2><FormattedMessage id="case.end" /></h2>
  </footer>
