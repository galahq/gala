/**
 * @providesModule AllQuizzes
 * @flow
 */

import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, Intent, NonIdealState } from '@blueprintjs/core'
import { Link } from 'react-router-dom'

import { deleteSuggestedQuiz, fetchSuggestedQuizzes } from 'redux/actions'

import type { IntlShape } from 'react-intl'
import type { DraftQuestion, State, SuggestedQuiz } from 'redux/state'

function mapStateToProps ({ suggestedQuizzes }: State) {
  return {
    quizzes: Object.values(suggestedQuizzes),
  }
}

type Props = {
  deleteSuggestedQuiz: typeof deleteSuggestedQuiz,
  fetchSuggestedQuizzes: typeof fetchSuggestedQuizzes,
  intl: IntlShape,
  quizzes: SuggestedQuiz[],
  onCreateQuiz: () => any,
}

function AllQuizzes ({
  deleteSuggestedQuiz,
  fetchSuggestedQuizzes,
  intl,
  onCreateQuiz,
  quizzes,
}: Props) {
  useEffect(() => {
    fetchSuggestedQuizzes()
  }, [])

  function handleDeleteQuiz (param) {
    if (
      window.confirm(
        intl.formatMessage({
          id: 'cases.edit.suggestedQuizzes.confirmDelete',
        })
      )
    ) {
      deleteSuggestedQuiz(param)
    }
  }

  return (
    <div className="bp3-dialog-body">
      {quizzes.length > 0 ? (
        <>
          <List>
            {quizzes.map(quiz => {
              const {
                multipleChoiceCount,
                openEndedCount,
              } = countQuestionTypes(quiz.questions)
              return (
                <ListItem key={quiz.param}>
                  <QuizLink to={`/suggested_quizzes/${quiz.param}`}>
                    <QuizTitle>{quiz.title}</QuizTitle>
                    <Tag>
                      <FormattedMessage
                        id="quizzes.quiz.multipleChoiceQuestions.js"
                        values={{ count: multipleChoiceCount }}
                      />
                    </Tag>
                    <Tag>
                      <FormattedMessage
                        id="quizzes.quiz.openEndedQuestions.js"
                        values={{ count: openEndedCount }}
                      />
                    </Tag>
                  </QuizLink>
                  <DeleteButton
                    aria-label={intl.formatMessage({
                      id: 'cases.edit.suggestedQuizzes.deleteQuiz',
                    })}
                    onClick={() => handleDeleteQuiz(quiz.param)}
                  />
                </ListItem>
              )
            })}
          </List>
          <NewQuizButton onClick={onCreateQuiz} />
        </>
      ) : (
        <NonIdealState
          visual="properties"
          title={
            <FormattedMessage id="cases.edit.suggestedQuizzes.suggestAnAssessment" />
          }
          description={
            <FormattedMessage id="cases.edit.suggestedQuizzes.description" />
          }
          action={<NewQuizButton onClick={onCreateQuiz} />}
        />
      )}
    </div>
  )
}

export default injectIntl(
  connect(
    mapStateToProps,
    { deleteSuggestedQuiz, fetchSuggestedQuizzes }
  )(AllQuizzes)
)

function countQuestionTypes (questions: DraftQuestion[]) {
  let multipleChoiceCount = 0
  let openEndedCount = 0

  questions.forEach(question => {
    question.options.length > 0 ? multipleChoiceCount++ : openEndedCount++
  })

  return { multipleChoiceCount, openEndedCount }
}

const List = styled.ul`
  list-style: none;
  padding: 0;
`
const ListItem = styled.li`
  align-items: baseline;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5em;
  padding: 0.25em 0.5em;
  width: 100%;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`

const QuizLink = styled(Link)`
  align-items: baseline;
  display: flex;
`

const QuizTitle = styled.span`
  color: white;
  flex: 1;
  font-weight: 500;
  padding-right: 1em;
`

const Tag = styled.span.attrs({ className: 'bp3-tag bp3-minimal bp3-large' })`
  margin-left: 0.3em;
`

const DeleteButton = styled.button.attrs({
  className: 'bp3-button bp3-minimal bp3-intent-danger bp3-icon-trash',
})``

function NewQuizButton ({ onClick }) {
  return (
    <Button intent={Intent.SUCCESS} icon="add" onClick={onClick}>
      <FormattedMessage id="quizzes.new.newQuiz" />
    </Button>
  )
}
