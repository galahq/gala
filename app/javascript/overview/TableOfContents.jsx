/**
 * @providesModule TableOfContents
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { withRouter } from 'react-router-dom'
import { Droppable } from 'react-beautiful-dnd'

import { createPage, createPodcast, createActivity } from 'redux/actions'

import TableOfContentsElement from './TableOfContentsElement'
import {
  Title,
  OuterContainer,
  Container,
  NoElements,
  List,
  Actions,
  AddButton,
  AssessmentButton,
} from 'table_of_contents/shared'

import PretestOverlay from 'quiz/PretestOverlay'
import PostTestLink from 'quiz/PostTestLink'

import type { State, CaseElement } from 'redux/state'

function mapStateToProps ({ caseData, edit, quiz }: State) {
  return {
    caseElements: caseData.caseElements,
    caseSlug: caseData.slug,
    disabled: !caseData.reader,
    editing: edit.inProgress,
    hasQuiz: !!quiz.questions && quiz.questions.length > 0,
    needsPretest: quiz.needsPretest,
  }
}

type Props = {
  caseElements: CaseElement[],
  caseSlug: string,
  createActivity: typeof createActivity,
  createPage: typeof createPage,
  createPodcast: typeof createPodcast,
  disabled: boolean,
  editing: boolean,
  hasQuiz: boolean,
  needsPretest: boolean,
  onSidebar: boolean,
}

function TableOfContents ({
  caseElements,
  caseSlug,
  createActivity,
  createPage,
  createPodcast,
  disabled,
  editing,
  hasQuiz,
  needsPretest,
  onSidebar,
}: Props) {
  return (
    <OuterContainer>
      <Container>
        <Title>
          <FormattedMessage id="cases.show.toc" />
        </Title>

        {(caseElements && caseElements.length > 0) || editing || (
          <NoElements>
            <FormattedMessage id="cases.edit.noElements" />
          </NoElements>
        )}

        <Droppable droppableId="table-of-contents" type="CaseElement">
          {(provided, snapshot) => (
            <List
              ref={provided.innerRef}
              isDraggingOver={snapshot.isDraggingOver}
            >
              {caseElements.map((caseElement, index) => (
                <TableOfContentsElement
                  caseElement={caseElement}
                  key={caseElement.id}
                  position={index}
                  readOnly={onSidebar}
                />
              ))}

              {editing && (
                <Actions vertical={onSidebar}>
                  <AddButton onClick={() => createPage(caseSlug)}>
                    <FormattedMessage id="activerecord.models.page" />
                  </AddButton>
                  <AddButton onClick={() => createPodcast(caseSlug)}>
                    <FormattedMessage id="activerecord.models.podcast" />
                  </AddButton>
                  <AddButton onClick={() => createActivity(caseSlug)}>
                    <FormattedMessage id="activerecord.models.activity" />
                  </AddButton>
                </Actions>
              )}

              {provided.placeholder}
            </List>
          )}
        </Droppable>

        {needsPretest && <PretestOverlay />}
        {!needsPretest && hasQuiz && <PostTestLink />}
      </Container>

      {editing && (
        <AssessmentButton to="/suggested_quizzes">
          <FormattedMessage id="cases.edit.suggestedQuizzes.prePostAssessment" />
        </AssessmentButton>
      )}
    </OuterContainer>
  )
}

export default withRouter(
  connect(
    mapStateToProps,
    { createPage, createPodcast, createActivity }
  )(TableOfContents)
)
