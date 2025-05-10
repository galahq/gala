/**
 * @providesModule QuizDetails
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'
import styled from 'styled-components'
import { Button, FormGroup, Intent, InputGroup } from '@blueprintjs/core'

import QuizCustomizer from 'quiz/customizer'
import { validatedQuestions } from 'suggested_quizzes/helpers'

import {
  createSuggestedQuiz,
  updateSuggestedQuiz,
  displayErrorToast,
  removeSuggestedQuiz,
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
  createSuggestedQuiz: typeof createSuggestedQuiz,
}
function QuizDetails ({
  displayErrorToast,
  history,
  id,
  intl,
  quiz,
  updateSuggestedQuiz,
  createSuggestedQuiz,
}: Props) {
  const [draftQuiz, setDraftQuiz] = React.useState(quiz)
  const { questions, title } = draftQuiz

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
    setDraftQuiz(validatedQuiz)
    if (id === "new") {
        createSuggestedQuiz(draftQuiz).then(() => {
          removeSuggestedQuiz(id)
          history.replace('/suggested_quizzes/')
        }).catch((error) => {
          displayErrorToast(error.message)
        })
    } else {
      updateSuggestedQuiz(id, draftQuiz)
      history.replace('/suggested_quizzes/')
    }
  }

  function handleCancel () {
    if (id === "new") {
      removeSuggestedQuiz(id)
    }
    history.replace(window.location.href + '/suggested_quizzes/')
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
          <Button style={{ marginRight: '10px' }} onClick={handleCancel}>
            <FormattedMessage id="helpers.cancel" defaultMessage="Cancel" />
          </Button>
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
    { updateSuggestedQuiz, createSuggestedQuiz, displayErrorToast }
  )(QuizDetails)
)

const TitleField = styled(InputGroup).attrs({
  large: true,
  type: 'text',
})``

const Card = styled.ol.attrs({
  className: 'pt-card',
})`
  padding: 1em 1em 1em 2em;
`
