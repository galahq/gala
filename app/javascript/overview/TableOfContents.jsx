/**
 * @providesModule TableOfContents
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { withRouter } from 'react-router-dom'
import HTML5Backend from 'react-dnd-html5-backend'
import { DropTarget, DragDropContext } from 'react-dnd'

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
      readOnly,
      createPage,
      createPodcast,
      createActivity,
      hasQuiz,
    } = this.props
    return (
      <nav className={`c-toc pt-dark ${disabled && 'c-toc--disabled'}`}>
        <h2 className="c-toc__header">
          <FormattedMessage id="cases.show.toc" />
        </h2>
        {connectDropTarget(
          <ol className="c-toc__list">
            {elements.map((element, index) => (
              <TableOfContentsElement
                element={element}
                key={element.id}
                position={index + 1}
                readOnly={readOnly}
              />
            ))}
            {editing &&
              !readOnly && (
              <div className="c-toc__actions pt-button-group pt-fill">
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
    )
  }
}

const DragDropTableOfContents = DragDropContext(HTML5Backend)(
  DropTarget(ItemTypes.CASE_ELEMENT, { drop: () => {} }, connect => ({
    connectDropTarget: connect.dropTarget(),
  }))(TableOfContents)
)

export default withRouter(
  connect(mapStateToProps, { createPage, createPodcast, createActivity })(
    DragDropTableOfContents
  )
)
