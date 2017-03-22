import React from 'react'
import { connect } from 'react-redux'
import { Route, Redirect, Link } from 'react-router-dom'
import DocumentTitle from 'react-document-title'

import Sidebar from 'Sidebar.js'
import Page from 'Page.js'
import Podcast from 'Podcast.js'
import Activity from 'Activity.js'
import EdgenoteContents from 'EdgenoteContents.js'

import { FormattedMessage } from 'react-intl'

function mapStateToProps(state, {match}) {
  const position = parseInt(match.params.position, 10) - 1
  const element = state.caseData.caseElements[position]
  if (!element)  return {}

  const {elementType: model, elementId, elementStore} = element

  const nextElement = state.caseData.caseElements[position + 1]
  const {elementId: nextElementId, elementStore: nextElementStore} = nextElement
    ? nextElement : {}

  return {
    kicker: state.caseData.kicker,
    reader: state.caseData.reader,
    editing: state.edit.inProgress,
    next: nextElement && {
      title: state[nextElementStore][nextElementId].title,
      position: (position + 2),
    },
    title: state[elementStore][elementId].title,
    id: elementId,
    model,
  }
}

class CaseElement extends React.Component {

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.position !== this.props.match.params.position)
      window.scrollTo(0, 0)
  }

  render() {
    const {kicker, title, reader, editing, model, id, next} = this.props
    if (!reader)  return <Redirect to="/" />

    var child
    switch (model) {
      case 'Page': child = <Page id={id} />; break
      case 'Podcast': child = <Podcast id={id} />; break
      case 'Activity': child = <Activity id={id} />; break
      case undefined: return <Redirect to="/" />
    }

    return <div className={`window ${editing ? 'editing' : ""}`}>
      <Sidebar />
      <main className={`s-CaseElement__${model}`}>
        <a id="top" />

        <DocumentTitle title={`${kicker} — ${title} — Michigan Sustainability Cases`}>
          { child }
        </DocumentTitle>

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
