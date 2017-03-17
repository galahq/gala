import React from 'react'
import { connect } from 'react-redux'
import { Route, Redirect, Link } from 'react-router-dom'

import Sidebar from 'Sidebar.js'
import Page from 'Page.js'
import Podcast from 'Podcast.js'
import Activity from 'Activity.js'
import EdgenoteContents from 'EdgenoteContents.js'

import { FormattedMessage } from 'react-intl'

function mapStateToProps(state, {match}) {
  const position = parseInt(match.params.position, 10) - 1
  const uri = state.caseData.caseElements[position]
  if (!uri)  return {}

  const [model, idString] = uri.split('/')

  const next = state.caseData.caseElements[position + 1]
  const [nextModel, nextId] = next ? next.split('/') : []

  return {
    reader: state.caseData.reader,
    editing: state.edit.inProgress,
    next: next && {
      title: state[`${nextModel}ById`][nextId].title,
      position: (position + 2),
    },
    id: parseInt(idString, 10),
    model,
  }
}

class CaseElement extends React.Component {

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.position !== this.props.match.params.position)
      window.scrollTo(0, 0)
  }

  render() {
    const {reader, editing, model, id, next} = this.props
    if (!reader)  return <Redirect to="/" />

    var child
    switch (model) {
      case 'pages': child = <Page id={id} />; break
      case 'podcasts': child = <Podcast id={id} />; break
      case 'activities': child = <Activity id={id} />; break
      case undefined: return <Redirect to="/" />
    }

    return <div className={`window ${editing && 'editing'}`}>
      <Sidebar />
      <main>
        <a id="top" />

        { child }

        <Route path={`/:position/edgenotes/:edgenoteSlug`} component={EdgenoteContents} />
        <NextLink next={next} />
      </main>
    </div>
  }

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
