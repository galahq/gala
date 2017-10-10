/**
 * @providesModule Deployment
 * @flow
 */

import React from 'react'
import { map } from 'ramda'

import QuizSelector from './QuizSelector'
import QuizDetails from './QuizDetails'
import Toolbar from './Toolbar'

import { Intent, Toaster } from '@blueprintjs/core'
import hackIntoReactAndCreateAToasterBecauseBlueprintDoesntSupportFiberYet from 'shared/badTerribleAwfulCode'

import type { IntentType } from '@blueprintjs/core'

import { Orchard } from 'shared/orchard'
import { chooseContentItem } from 'shared/lti'

import type { ID, Quiz, Question } from './types'

type Props = {
  id: string,
  caseData: {
    kicker: string,
    title: string,
    coverUrl: string,
    callbackUrl: string,
  },
  selectedQuizId: ?ID,
  recommendedQuizzes: { [id: string]: Quiz },
  returnUrl?: string,
  returnData?: string,
}

type State = {
  selectedQuizId: ?ID,
  customQuestions: { [id: string]: Question[] },
  answersNeeded: 1 | 2,
}

const questionHasError = (question: Question) =>
  !question.content ||
  (question.options.length === 0
    ? question.correctAnswer === '' || question.correctAnswer == null
    : !question.options.some(
        (option: string) => option === question.correctAnswer
      ))

const validated = map((question: Question) => ({
  ...question,
  hasError: questionHasError(question),
}))

class Deployment extends React.Component {
  props: Props
  state: State
  toaster: Toaster

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
      (question: Question) => question.hasError
    )
  }

  _displayToast = (error: string, intent: IntentType = Intent.WARNING) => {
    this.toaster.show({
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

  handleChangeCustomQuestions = (quizId: ID, customQuestions: Question[]) => {
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
        .then((data: Props) => {
          const { returnUrl, returnData, caseData } = this.props
          if (returnUrl != null && returnData != null) {
            chooseContentItem(returnUrl, returnData, caseData.callbackUrl)
          } else {
            this._displayToast(
              'Deployment successfully updated; get the user off this page or refresh.',
              Intent.SUCCESS
            )
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
      (quiz: Quiz) => quiz.customQuestions,
      props.recommendedQuizzes
    )
    this.state = {
      selectedQuizId: props.selectedQuizId,
      answersNeeded: 2,
      customQuestions,
    }

    // this.toaster = Toaster.create()
    hackIntoReactAndCreateAToasterBecauseBlueprintDoesntSupportFiberYet(
      toaster => (this.toaster = toaster)
    )
  }

  render () {
    const { caseData, recommendedQuizzes } = this.props
    const { selectedQuizId, customQuestions } = this.state
    return (
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
            onChangeCustomQuestions={(newCustomQuestions: Question[]) =>
              this.handleChangeCustomQuestions(
                selectedQuizId,
                newCustomQuestions
              )}
            onDeselect={() => this.handleSelectQuiz(null)}
          />
        )}
        <Toolbar
          withPretest={this._needsPretest()}
          withPosttest={this._needsPosttest()}
          caseData={caseData}
          onTogglePretest={this.handleTogglePretest}
          onDeselect={() => this.handleSelectQuiz(null)}
          onSubmit={this.handleSubmit}
        />
      </div>
    )
  }
}

export default Deployment
