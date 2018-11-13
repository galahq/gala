/**
 * @providesModule QuizDetails
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { FormGroup, InputGroup } from '@blueprintjs/core'

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
    <>
      <div className="pt-dialog-body">
        <FormGroup label="Quiz title" labelFor="quiz[title]">
          <TitleField
            id="quiz[title]"
            placeholder="Untitled Quiz"
            value={title}
            onChange={handleChangeTitle}
          />
        </FormGroup>

        <Card>
          <QuizCustomizer
            customQuestions={questions}
            onChange={handleChangeQuestions}
          />
        </Card>
      </div>

      <div className="pt-dialog-footer">
        <div className="pt-dialog-footer-actions">
          <Link className="pt-button pt-intent-primary" to="/suggested_quizzes">
            <FormattedMessage id="helpers.save" />
          </Link>
        </div>
      </div>
    </>
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

const Card = styled.ol.attrs({
  className: 'pt-card',
})`
  padding: 1em 1em 1em 2em;
`
