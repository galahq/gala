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

import {deleteElement} from 'redux/actions.js'

function mapStateToProps(state, {match}) {
  const position = parseInt(match.params.position, 10) - 1
  const caseElement = state.caseData.caseElements[position]
  if (!caseElement)  return {}

  const {elementType: model, elementId, elementStore} = caseElement

  const nextElement = state.caseData.caseElements[position + 1]
  const {elementId: nextElementId, elementStore: nextElementStore} = nextElement
    ? nextElement : {}

  const {title, url} = state[elementStore][elementId]

  return {
    kicker: state.caseData.kicker,
    reader: state.caseData.reader,
    editing: state.edit.inProgress,
    next: nextElement && {
      title: state[nextElementStore][nextElementId].title,
      position: (position + 2),
    },
    id: elementId,
    url: url.substring(1),  // Because rails url_for helper returns /pages/:id
    title,
    model,
    position,
  }
}

class CaseElement extends React.Component {
  constructor(props) {
    super(props)
    this._scrollToTop = () => window.scrollTo(0, 0)

  }

  componentDidMount() {
    this._scrollToTop()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.position !== this.props.match.params.position)
      this._scrollToTop()
  }

  render() {
    const {kicker, title, reader, editing, model, id, next, url,
      deleteElement, position, history} = this.props

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
          { React.cloneElement(child, {
            deleteElement: () =>
              {deleteElement(url, position) && history.push('/')},
          } )}
        </DocumentTitle>

        <Route path={`/:position/edgenotes/:edgenoteSlug`} component={EdgenoteContents} />
        <NextLink next={next} />
      </main>
    </div>
  }

}

export default connect(mapStateToProps, {deleteElement})(CaseElement)


const NextLink = ({next}) => next
  ? <Link className="nextLink" to={`/${next.position}`}>
    <FormattedMessage id="case.next" />
    {next.title}
  </Link>
  : <footer>
    <h2><FormattedMessage id="case.end" /></h2>
  </footer>
