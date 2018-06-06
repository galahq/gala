/**
 * @providesModule CaseElement
 * @flow
 */
import * as React from 'react'
import { connect } from 'react-redux'
import { Route, Redirect, Link } from 'react-router-dom'
import DocumentTitle from 'react-document-title'

import Sidebar from './Sidebar'
import Page from './Page'
import Podcast from 'podcast'
import Activity from './Activity'
import EdgenoteContents from 'deprecated/EdgenoteContents'

import Tracker from 'utility/Tracker'

import { FormattedMessage } from 'react-intl'

import { deleteElement } from 'redux/actions'

import type { ContextRouter } from 'react-router-dom'
import type { State, Reader } from 'redux/state'

function mapStateToProps (state: State, { match }) {
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
  }
}

class CaseElement extends React.Component<{
  kicker: string,
  reader: Reader,
  editing: boolean,
  next: ?{ position: string, title: string },
  id: string,
  url: string,
  title: string,
  model: string,
  position: number,
  deleteElement: typeof deleteElement,
  ...ContextRouter,
}> {
  _scrollToTop: () => void

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
    } = this.props

    const redirectToOverview = <Redirect to="/" />

    if (!reader) return redirectToOverview

    const models = { Page, Podcast, Activity }
    const Child = models[model]
    const deleteElement = () => {
      this.props
        .deleteElement(url, position)
        .then(confirmed => confirmed && history.push('/'))
    }

    return (
      <div className={`window ${editing ? 'editing' : ''}`}>
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

export default connect(mapStateToProps, { deleteElement })(CaseElement)

type NextProps = ?{ title: string, position: string }

const NextLink = ({ next }: { next: NextProps }) =>
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
  (state: State, ownProps: { next: NextProps }) => {
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
