/**
 * @providesModule AllQuizzes
 * @flow
 */

import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { Button, Intent, NonIdealState } from '@blueprintjs/core'
import { Link } from 'react-router-dom'

import { Title } from 'suggested_quizzes/styled'

import { fetchSuggestedQuizzes } from 'redux/actions'

import type { DraftQuestion, State, SuggestedQuiz } from 'redux/state'

function mapStateToProps ({ suggestedQuizzes }: State) {
  return {
    quizzes: Object.values(suggestedQuizzes),
  }
}

type Props = {
  fetchSuggestedQuizzes: typeof fetchSuggestedQuizzes,
  quizzes: SuggestedQuiz[],
  onCreateQuiz: () => any,
}

function AllQuizzes ({ fetchSuggestedQuizzes, onCreateQuiz, quizzes }: Props) {
  useEffect(() => fetchSuggestedQuizzes(), [])

  return (
    <>
      <Title>
        <FormattedMessage id="cases.edit.suggestedQuizzes.title" />
      </Title>

      <Card>
        {quizzes.length > 0 ? (
          <List>
            {quizzes.map(quiz => {
              const {
                multipleChoiceCount,
                openEndedCount,
              } = countQuestionTypes(quiz.questions)
              return (
                <li key={quiz.param}>
                  <Link to={`/suggested_quizzes/${quiz.param}`}>
                    {quiz.title}
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
                  </Link>
                </li>
              )
            })}
          </List>
        ) : (
          <NonIdealState
            visual="properties"
            title={
              <FormattedMessage id="cases.edit.suggestedQuizzes.suggestAnAssessment" />
            }
            description={
              <FormattedMessage id="cases.edit.suggestedQuizzes.description" />
            }
            action={
              <Button intent={Intent.SUCCESS} icon="add" onClick={onCreateQuiz}>
                <FormattedMessage id="quizzes.new.newQuiz" />
              </Button>
            }
          />
        )}
      </Card>
    </>
  )
}

export default connect(
  mapStateToProps,
  { fetchSuggestedQuizzes }
)(AllQuizzes)

function countQuestionTypes (questions: DraftQuestion[]) {
  let multipleChoiceCount = 0
  let openEndedCount = 0

  questions.forEach(question => {
    question.options.length > 0 ? multipleChoiceCount++ : openEndedCount++
  })

  return { multipleChoiceCount, openEndedCount }
}

const Card = styled.div.attrs({ className: 'pt-card' })`
  background-color: #ebeae4;
  max-width: 45em;
`

const List = styled.ul`
  list-style: none;
`
const Tag = styled.span.attrs({ className: 'pt-tag pt-minimal pt-large' })`
  margin-left: 0.3em;
`
