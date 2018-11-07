/**
 * @providesModule TableOfContents
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { Link, withRouter } from 'react-router-dom'
import HTML5Backend from 'react-dnd-html5-backend'
import { DropTarget, DragDropContext } from 'react-dnd'
import styled from 'styled-components'

import { createPage, createPodcast, createActivity } from 'redux/actions'

import { ItemTypes } from 'shared/dndConfig'
import TableOfContentsElement from './TableOfContentsElement'

import PostTestLink from 'quiz/PostTestLink'

import type { State } from 'redux/state'

function mapStateToProps ({ caseData, edit, quiz }: State) {
  return {
    caseSlug: caseData.slug,
    elements: caseData.caseElements,
    disabled: !caseData.reader,
    editing: edit.inProgress,
    hasQuiz: !!quiz.questions && quiz.questions.length > 0,
  }
}

// eslint-disable-next-line react/prefer-stateless-function
class TableOfContents extends React.Component<*> {
  render () {
    const {
      caseSlug,
      editing,
      elements,
      disabled,
      connectDropTarget,
      onSidebar,
      createPage,
      createPodcast,
      createActivity,
      hasQuiz,
    } = this.props
    return (
      <Container>
        <nav className={`c-toc pt-dark ${disabled && 'c-toc--disabled'}`}>
          <h2 className="c-toc__header">
            <FormattedMessage id="cases.show.toc" />
          </h2>

          {(elements && elements.length > 0) ||
            editing || (
            <NoElements>
              <FormattedMessage id="cases.edit.noElements" />
            </NoElements>
          )}

          {connectDropTarget(
            <ol className="c-toc__list">
              {elements.map((element, index) => (
                <TableOfContentsElement
                  element={element}
                  key={element.id}
                  position={index + 1}
                  readOnly={onSidebar}
                />
              ))}
              {editing && (
                <div
                  className={`c-toc__actions pt-button-group pt-fill ${
                    onSidebar ? 'pt-vertical' : ''
                  }`}
                >
                  <button
                    type="button"
                    className="pt-button pt-icon-add"
                    onClick={() => createPage(caseSlug)}
                  >
                    <FormattedMessage id="activerecord.models.page" />
                  </button>
                  <button
                    type="button"
                    className="pt-button pt-icon-add"
                    onClick={() => createPodcast(caseSlug)}
                  >
                    <FormattedMessage id="activerecord.models.podcast" />
                  </button>
                  <button
                    type="button"
                    className="pt-button pt-icon-add"
                    onClick={() => createActivity(caseSlug)}
                  >
                    <FormattedMessage id="activerecord.models.activity" />
                  </button>
                </div>
              )}
            </ol>
          )}

          {hasQuiz && <PostTestLink />}
        </nav>

        {editing && (
          <AssessmentButton to="/suggested_quizzes">
            <FormattedMessage id="cases.edit.suggestedQuizzes.prePostAssessment" />
          </AssessmentButton>
        )}
      </Container>
    )
  }
}

const DragDropTableOfContents = DragDropContext(HTML5Backend)(
  DropTarget(ItemTypes.CASE_ELEMENT, { drop: () => {} }, connect => ({
    connectDropTarget: connect.dropTarget(),
  }))(TableOfContents)
)

export default withRouter(
  connect(
    mapStateToProps,
    { createPage, createPodcast, createActivity }
  )(DragDropTableOfContents)
)

const Container = styled.div.attrs({ className: 'pt-dark' })``

const NoElements = styled.p`
  margin: 0.5em;
  opacity: 0.5;
`

const AssessmentButton = styled(Link).attrs({
  className: 'pt-button pt-fill',
})`
  margin-top: 1em;
`
