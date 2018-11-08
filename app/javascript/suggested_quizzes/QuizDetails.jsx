/**
 * @providesModule QuizDetails
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { FormGroup, Icon, InputGroup } from '@blueprintjs/core'

import QuizCustomizer from 'deployment/QuizCustomizer'

import { updateSuggestedQuiz } from 'redux/actions'

import type { State, DraftQuestion, SuggestedQuiz } from 'redux/state'

type OwnProps = {
  id: string,
}

function mapStateToProps ({ suggestedQuizzes }: State, { id }: OwnProps) {
  return {
    quiz: suggestedQuizzes[id],
  }
}

type Props = OwnProps & {
  quiz: SuggestedQuiz,
  updateSuggestedQuiz: typeof updateSuggestedQuiz,
}
function QuizDetails ({ id, quiz, updateSuggestedQuiz }: Props) {
  const { questions, title } = quiz

  function handleChangeTitle (e: SyntheticInputEvent<*>) {
    updateSuggestedQuiz(id, { ...quiz, title: e.target.value })
  }

  function handleChangeQuestions (questions: DraftQuestion[]) {
    updateSuggestedQuiz(id, { ...quiz, questions })
  }

  return (
    <div className="pt-dark">
      <Link className="pt-button pt-minimal" to="/suggested_quizzes">
        <Icon icon="left-arrow" />
        <FormattedMessage id="cases.edit.suggestedQuizzes.allSuggestedQuizzes" />
      </Link>

      <FormGroup label="Quiz title" labelFor="quiz[title]">
        <TitleField
          id="quiz[title]"
          placeholder="Untitled Quiz"
          value={title}
          onChange={handleChangeTitle}
        />
      </FormGroup>

      <ol className="pt-card">
        <QuizCustomizer
          customQuestions={questions}
          onChange={handleChangeQuestions}
        />
      </ol>
    </div>
  )
}

export default connect(
  mapStateToProps,
  { updateSuggestedQuiz }
)(QuizDetails)

const TitleField = styled(InputGroup).attrs({
  large: true,
  type: 'text',
})``
