/**
 * @providesModule Deployment
 * @flow
 */

import * as React from 'react'
import { map } from 'ramda'

import QuizSelector from './QuizSelector'
import QuizDetails from './QuizDetails'
import Toolbar from './Toolbar'

import { Intent } from '@blueprintjs/core'
import Toaster from 'shared/Toaster'

import type { IntentType } from '@blueprintjs/core'

import { Orchard } from 'shared/orchard'
import { chooseContentItem } from 'shared/lti'

import type { ID, CustomizedQuiz, DraftQuestion } from './types'

type Props = {
  id: string,
  caseData: {
    kicker: string,
    title: string,
    coverUrl: string,
    callbackUrl: string,
  },
  selectedQuizId: ?ID,
  recommendedQuizzes: { [id: string]: CustomizedQuiz },
  returnUrl?: string,
  returnData?: string,
}

type State = {
  selectedQuizId: ?ID,
  customQuestions: { [id: string]: DraftQuestion[] },
  answersNeeded: 1 | 2,
}

const questionHasError = (question: DraftQuestion) =>
  !question.content ||
  (question.options.length === 0
    ? question.correctAnswer === '' || question.correctAnswer == null
    : !question.options.some(
      (option: string) => option === question.correctAnswer
    ))

const validated = map((question: DraftQuestion) => ({
  ...question,
  hasError: questionHasError(question),
}))

class Deployment extends React.Component<Props, State> {
  _needsPretest = () => {
    return this.state.selectedQuizId != null && this.state.answersNeeded === 2
  }
  _needsPosttest = () => {
    return this.state.selectedQuizId != null
  }

  _valid = () => {
    const state = this.state
    const { selectedQuizId, customQuestions } = state

    if (selectedQuizId == null) return true

    const validatedState = {
      ...state,
      customQuestions: {
        ...customQuestions,
        [`${selectedQuizId}`]: validated(customQuestions[`${selectedQuizId}`]),
      },
    }
    this.setState(validatedState)
    return !validatedState.customQuestions[`${selectedQuizId}`].some(
      (question: DraftQuestion) => question.hasError
    )
  }

  _displayToast = (error: string, intent: IntentType = Intent.WARNING) => {
    Toaster.show({
      message: error,
      intent,
    })
  }

  handleSelectQuiz = (quizId: ?ID) => {
    this.setState({ selectedQuizId: quizId })
  }

  handleTogglePretest = () => {
    this.setState((state: State) => ({
      ...state,
      answersNeeded: state.answersNeeded === 1 ? 2 : 1,
    }))
  }

  handleChangeCustomQuestions = (
    quizId: ID,
    customQuestions: DraftQuestion[]
  ) => {
    this.setState((state: State) => ({
      ...state,
      customQuestions: { ...state.customQuestions, [quizId]: customQuestions },
    }))
  }

  handleSubmit = () => {
    if (this._valid()) {
      const { answersNeeded, selectedQuizId, customQuestions } = this.state
      Orchard.espalier(`deployments/${this.props.id}`, {
        deployment: {
          answersNeeded: this._needsPosttest() ? answersNeeded : 0,
          quizId: selectedQuizId === 'new' ? null : selectedQuizId,
          customQuestions:
            selectedQuizId != null ? customQuestions[`${selectedQuizId}`] : [],
        },
      })
        .then(({ redirect }: { redirect: string }) => {
          const { returnUrl, returnData, caseData } = this.props
          if (returnUrl != null && returnData != null) {
            chooseContentItem(returnUrl, returnData, caseData.callbackUrl)
          } else {
            window.location = redirect
          }
        })
        .catch((e: Error) => this._displayToast(e.message))
    } else {
      this._displayToast(
        'Please ensure that there are no blank questions and that you have chosen correct answers for all questions.'
      )
    }
  }

  constructor (props: Props) {
    super(props)

    const customQuestions = map(
      (quiz: CustomizedQuiz) => quiz.customQuestions,
      props.recommendedQuizzes
    )
    this.state = {
      selectedQuizId: props.selectedQuizId,
      answersNeeded: 2,
      customQuestions,
    }
  }

  render () {
    const { caseData, recommendedQuizzes } = this.props
    const { selectedQuizId, customQuestions } = this.state
    return (
      <>
        <div className="pt-dark" style={{ padding: '0 12px' }}>
          {selectedQuizId == null ? (
            <QuizSelector
              recommendedQuizzes={recommendedQuizzes}
              customQuestions={customQuestions}
              onSelect={this.handleSelectQuiz}
            />
          ) : (
            <QuizDetails
              quiz={recommendedQuizzes[`${selectedQuizId}`]}
              customQuestions={customQuestions[`${selectedQuizId}`]}
              onChangeCustomQuestions={(newCustomQuestions: DraftQuestion[]) =>
                this.handleChangeCustomQuestions(
                  selectedQuizId,
                  newCustomQuestions
                )
              }
              onDeselect={() => this.handleSelectQuiz(null)}
            />
          )}
        </div>

        <Toolbar
          withPretest={this._needsPretest()}
          withPosttest={this._needsPosttest()}
          caseData={caseData}
          onTogglePretest={this.handleTogglePretest}
          onDeselect={() => this.handleSelectQuiz(null)}
          onSubmit={this.handleSubmit}
        />
      </>
    )
  }
}

export default Deployment
