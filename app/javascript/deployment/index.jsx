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
import { validatedQuestions } from 'suggested_quizzes/helpers'

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
  suggestedQuizzes: { [id: string]: CustomizedQuiz },
  returnUrl?: string,
  returnData?: string,
}

type State = {
  selectedQuizId: ?ID,
  customQuestions: { [id: string]: DraftQuestion[] },
  answersNeeded: 1 | 2,
}

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

    if (!customQuestions[`${selectedQuizId}`] || customQuestions[`${selectedQuizId}`].length === 0) {
      return false
    }

    const validatedQuestionsList = validatedQuestions(customQuestions[`${selectedQuizId}`])
    const hasErrors = validatedQuestionsList.some(
      (question: DraftQuestion) => question.hasError
    )

    // Update state in next tick to avoid render-time state updates
    if (!hasErrors) {
      setTimeout(() => {
        this.setState({
          ...state,
          customQuestions: {
            ...customQuestions,
            [`${selectedQuizId}`]: validatedQuestionsList,
          },
        })
      }, 0)
    }

    return !hasErrors
  }

  _displayToast = (error: string, intent: IntentType = Intent.DANGER) => {
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
      props.suggestedQuizzes
    )
    this.state = {
      selectedQuizId: props.selectedQuizId,
      answersNeeded: 2,
      customQuestions,
    }
  }

  render () {
    const { caseData, suggestedQuizzes } = this.props
    const { selectedQuizId, customQuestions } = this.state
    return (
      <>
        <div className="pt-dark" style={{ padding: '0 12px' }}>
          {selectedQuizId == null ? (
            <QuizSelector
              suggestedQuizzes={suggestedQuizzes}
              customQuestions={customQuestions}
              onSelect={this.handleSelectQuiz}
            />
          ) : (
            <QuizDetails
              quiz={suggestedQuizzes[`${selectedQuizId}`]}
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
