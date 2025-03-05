/**
 * @providesModule QuizDetails
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'
import styled from 'styled-components'
import { Button, FormGroup, Intent, InputGroup } from '@blueprintjs/core'
import * as R from 'ramda'

import QuizCustomizer from 'quiz/customizer'
import { validatedQuestions } from 'suggested_quizzes/helpers'

import {
  updateSuggestedQuiz,
  displayErrorToast,
  setUnsaved,
} from 'redux/actions'

import type { IntlShape } from 'react-intl'
import type { RouterHistory } from 'react-router-dom'
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
  displayErrorToast: typeof displayErrorToast,
  intl: IntlShape,
  history: RouterHistory,
  quiz: SuggestedQuiz,
  updateSuggestedQuiz: typeof updateSuggestedQuiz,
}
function QuizDetails ({
  displayErrorToast,
  history,
  id,
  intl,
  quiz,
  updateSuggestedQuiz,
}: Props) {
  const [draftQuiz, setDraftQuiz] = React.useState(quiz)
  const { questions, title } = draftQuiz

  const unblock = blockRouting({ when: !R.equals(draftQuiz, quiz), history })

  function handleChangeTitle (e: SyntheticInputEvent<*>) {
    setDraftQuiz({ ...draftQuiz, title: e.target.value })
  }

  function handleChangeQuestions (questions: DraftQuestion[]) {
    setDraftQuiz({ ...draftQuiz, questions })
  }

  function handleSave () {
    let validatedQuiz = {
      ...draftQuiz,
      questions: validatedQuestions(draftQuiz.questions),
    }

    if (validatedQuiz.questions.some(question => !!question.hasError)) {
      setDraftQuiz(validatedQuiz)
      displayErrorToast(
        intl.formatMessage({ id: 'cases.edit.suggestedQuizzes.error' })
      )
    } else {
      updateSuggestedQuiz(id, draftQuiz)
      unblock()
      history.replace('/suggested_quizzes/')
    }
  }

  return (
    <>
      <div className="bp3-dialog-body">
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

      <div className="bp3-dialog-footer">
        <div className="bp3-dialog-footer-actions">
          <Button intent={Intent.PRIMARY} onClick={handleSave}>
            <FormattedMessage id="helpers.save" />
          </Button>
        </div>
      </div>
    </>
  )
}

export default injectIntl(
  connect(
    mapStateToProps,
    { updateSuggestedQuiz, displayErrorToast }
  )(QuizDetails)
)

function blockRouting ({ when: unsaved, history }) {
  if (unsaved) setUnsaved()
  return history.block(() => {
    if (unsaved) return 'Are you sure you want to close without saving?'
  })
}

const TitleField = styled(InputGroup).attrs({
  large: true,
  type: 'text',
})``

const Card = styled.ol.attrs({
  className: 'bp3-card',
})`
  padding: 1em 1em 1em 2em;
`
