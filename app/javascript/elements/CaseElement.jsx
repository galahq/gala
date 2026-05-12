/**
 * @providesModule CaseElement
 * 
 */
import * as React from 'react'
import { connect } from 'react-redux'
import { Route, Redirect, Link, matchPath } from 'react-router-dom'
import DocumentTitle from 'react-document-title'
import classNames from 'classnames'

import Sidebar from './Sidebar'
import Page from 'page'
import Podcast from 'podcast'
import EdgenoteContents from 'deprecated/EdgenoteContents'

import Tracker from 'utility/Tracker'

import { commentThreadsOpen, commentsOpen } from 'shared/routes'
import { FormattedMessage } from 'react-intl'

import { deleteElement } from 'redux/actions'


function mapStateToProps (state, { match, location }) {
  const position = parseInt(match.params.position, 10) - 1
  const caseElement = state.caseData.caseElements[position]
  if (!caseElement) return {}

  const { elementType: model, elementId, elementStore } = caseElement

  const nextElement = state.caseData.caseElements[position + 1]
  const { elementId: nextElementId, elementStore: nextElementStore } =
    nextElement || {}

  const { title, url } = state[elementStore][elementId]

  return {
    kicker: state.caseData.kicker,
    reader: state.caseData.reader,
    editing: state.edit.inProgress,
    next: nextElement
      ? {
          title: state[nextElementStore][nextElementId].title,
          position: `${position + 2}`,
        }
      : undefined,
    id: elementId,
    url,
    title,
    model,
    position,
    commentThreadsOpen: matchPath(location.pathname, commentThreadsOpen()),
    commentsOpen: matchPath(location.pathname, commentsOpen()),
  }
}

class CaseElement extends React.Component {
  _scrollToTop

  constructor (props) {
    super(props)
    this._scrollToTop = () => window.scrollTo(0, 0)
  }

  componentDidMount () {
    this._scrollToTop()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.match.params.position !== this.props.match.params.position) {
      this._scrollToTop()
    }
  }

  render () {
    const {
      kicker,
      title,
      reader,
      editing,
      model,
      id,
      next,
      url,
      position,
      history,
      commentThreadsOpen,
      commentsOpen,
    } = this.props

    const redirectToOverview = <Redirect to="/" />

  //  if (!reader) return redirectToOverview

    const models = { Page, Podcast }
    const Child = models[model]
    const deleteElement = () => {
      this.props
        .deleteElement(url, position)
        .then(confirmed => confirmed && history.push('/'))
    }

    return (
      <div
        className={classNames({
          window: true,
          editing,
          'has-comment-threads-open': commentThreadsOpen,
          'has-comments-open': commentsOpen,
        })}
      >
        <Sidebar editing={editing} />
        <main id="top" className={`main s-CaseElement__${model}`}>
          <DocumentTitle title={`${kicker} — ${title} — Gala`}>
            {Child ? (
              <Child id={id} deleteElement={deleteElement} />
            ) : (
              redirectToOverview
            )}
          </DocumentTitle>

          <Route
            path={`/:position/edgenotes/:edgenoteSlug`}
            component={EdgenoteContents}
          />
          <ConditionalNextLink next={next} />
        </main>

        <Tracker
          timerState="RUNNING"
          targetKey={url}
          targetParameters={{
            name: 'visit_element',
            element_type: model,
            element_id: id,
          }}
        />
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  { deleteElement }
)(CaseElement)


const NextLink = ({ next }) =>
  next ? (
    <Link className="nextLink" to={`/${next.position}`}>
      <FormattedMessage id="cases.show.next" />
      {next.title}
    </Link>
  ) : (
    <footer>
      <h2>
        <FormattedMessage id="cases.show.end" />
      </h2>
    </footer>
  )

const ConditionalNextLink = connect(
  (state, ownProps) => {
    const postTestNext = state.quiz.needsPosttest
      ? {
          title: 'Check your understanding',
          position: 'quiz',
        }
      : null
    return {
      next: ownProps.next || postTestNext,
    }
  },
  () => ({})
)(NextLink)
