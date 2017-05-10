/**
 * @providesModule Deployment
 * @flow
 */

import React from 'react'
import { Map, List } from 'immutable'

import QuizSelector from './QuizSelector'
import QuizDetails from './QuizDetails'
import Toolbar from './Toolbar'

import { Position, Intent, Toaster } from '@blueprintjs/core'
import type { IntentType } from '@blueprintjs/core'

import { Orchard } from 'shared/orchard'
import { chooseContentItem } from 'shared/lti'

import { Question } from './types'
import type { ID, Quiz } from './types'

type Props = {
  id: string,
  caseData: $Supertype<{ callbackUrl: string }>,
  recommendedQuizzes: { [id: ID]: Quiz },
  returnUrl?: string,
  returnData?: string,
}

type State = {
  selectedQuizId: ?ID,
  customQuestions: Map<ID, List<Question>>,
  answersNeeded: 1 | 2,
}

class Deployment extends React.Component {
  props: Props
  state: State = {
    selectedQuizId: null,
    customQuestions: Map(),
    answersNeeded: 2,
  }

  toaster: Toaster

  _needsPretest: () => boolean
  _needsPosttest: () => boolean
  _valid: () => boolean
  _displayToast: (string, ?IntentType) => void

  handleSelectQuiz: (quizId: ?ID) => void
  handleTogglePretest: () => void
  handleSubmit: () => void

  _needsPretest () {
    return this.state.selectedQuizId != null && this.state.answersNeeded === 2
  }
  _needsPosttest () {
    return this.state.selectedQuizId != null
  }

  _valid () {
    const state = this.state
    const { selectedQuizId, customQuestions } = state

    if (selectedQuizId == null) return true
    const validatedState = {
      ...state,
      customQuestions: customQuestions.set(
        selectedQuizId,
        customQuestions
          .get(selectedQuizId, List())
          .map((question: Question) =>
            question.set(
              'hasError',
              question.getOptions().size !== 0 &&
                !question
                  .getOptions()
                  .some((option: string) => option === question.getAnswer())
            )
          )
      ),
    }
    this.setState(validatedState)
    return !validatedState.customQuestions
      .get(selectedQuizId)
      .some((question: Question) => question.hasError())
  }

  _displayToast (error: string, intent: IntentType = Intent.WARNING) {
    this.toaster.show({
      message: error,
      intent,
    })
  }

  handleSelectQuiz (quizId: ?ID) {
    this.setState({ selectedQuizId: quizId })
  }

  handleTogglePretest () {
    this.setState((state: State) => ({
      ...state,
      answersNeeded: state.answersNeeded === 1 ? 2 : 1,
    }))
  }

  handleChangeCustomQuestions (quizId: ID, customQuestions: List<Question>) {
    this.setState((state: State) => ({
      ...state,
      customQuestions: state.customQuestions.set(quizId, customQuestions),
    }))
  }

  handleSubmit () {
    if (this._valid()) {
      Orchard.espalier(`deployments/${this.props.id}`, {
        deployment: {
          answersNeeded: this._needsPosttest() ? this.state.answersNeeded : 0,
          templateId: this.state.selectedQuizId,
          customQuestions: this.state.selectedQuizId != null
            ? this.state.customQuestions.get(this.state.selectedQuizId)
            : [],
        },
      })
        .then(() => {
          const { returnUrl, returnData, caseData } = this.props
          if (returnUrl != null && returnData != null) {
            chooseContentItem(returnUrl, returnData, caseData.callbackUrl)
          } else {
            this._displayToast(
              'Deployment successfully updated.',
              Intent.SUCCESS
            )
          }
        })
        .catch((e: Error) => this._displayToast(e.message))
    } else {
      this._displayToast(
        'Please choose correct answers for all multiple choice questions.'
      )
    }
  }

  constructor (props: Props) {
    super(props)

    this.toaster = Toaster.create()

    this._needsPretest = this._needsPretest.bind(this)
    this._needsPosttest = this._needsPosttest.bind(this)
    this._valid = this._valid.bind(this)
    this._displayToast = this._displayToast.bind(this)
    this.handleSelectQuiz = this.handleSelectQuiz.bind(this)
    this.handleTogglePretest = this.handleTogglePretest.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  render () {
    const { caseData, recommendedQuizzes } = this.props
    const { selectedQuizId, customQuestions } = this.state
    return (
      <div className="pt-dark" style={{ padding: '0 12px' }}>
        {selectedQuizId == null
          ? <QuizSelector
            recommendedQuizzes={recommendedQuizzes}
            onSelect={this.handleSelectQuiz}
          />
          : <QuizDetails
            quiz={recommendedQuizzes[selectedQuizId]}
            customQuestions={customQuestions.get(selectedQuizId)}
            onChangeCustomQuestions={(newCustomQuestions: List<Question>) =>
                this.handleChangeCustomQuestions(
                  selectedQuizId,
                  newCustomQuestions
                )}
          />}
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
