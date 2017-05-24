/**
 * @providesModule Deployment
 * @flow
 */

import React from 'react'
import { Map, List } from 'immutable'

import QuizSelector from './QuizSelector'
import QuizDetails from './QuizDetails'
import Toolbar from './Toolbar'

import { Intent, Toaster } from '@blueprintjs/core'
import type { IntentType } from '@blueprintjs/core'

import { Orchard } from 'shared/orchard'
import { chooseContentItem } from 'shared/lti'

import { Question } from './types'
import type { ID, Quiz, QuestionSpec } from './types'

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
  customQuestions: Map<ID, List<Question>>,
  answersNeeded: 1 | 2,
}

class Deployment extends React.Component {
  props: Props
  state: State
  toaster: Toaster

  _needsPretest: () => boolean
  _needsPosttest: () => boolean
  _valid: () => boolean
  _displayToast: (error: string, intent: ?IntentType) => void

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
      const { answersNeeded, selectedQuizId, customQuestions } = this.state
      Orchard.espalier(`deployments/${this.props.id}`, {
        deployment: {
          answersNeeded: this._needsPosttest() ? answersNeeded : 0,
          quizId: selectedQuizId === 'new' ? null : selectedQuizId,
          customQuestions: selectedQuizId != null
            ? customQuestions.get(selectedQuizId)
            : [],
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
        'Please choose correct answers for all multiple choice questions.'
      )
    }
  }

  constructor (props: Props) {
    super(props)

    const customQuestions = Object.keys(
      props.recommendedQuizzes
    ).map((key: string) => {
      const quiz = props.recommendedQuizzes[key]
      const questions = quiz.customQuestions.map(question => {
        const q = new Question(question)
        return q.set('options', List(q.getOptions()))
      })
      return [quiz.id, new List(questions)]
    })
    this.state = {
      selectedQuizId: props.selectedQuizId,
      customQuestions: new Map(customQuestions),
      answersNeeded: 2,
    }

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
            quiz={recommendedQuizzes[`${selectedQuizId}`]}
            customQuestions={customQuestions.get(selectedQuizId)}
            onChangeCustomQuestions={(newCustomQuestions: List<Question>) =>
                this.handleChangeCustomQuestions(
                  selectedQuizId,
                  newCustomQuestions
                )}
            onDeselect={() => this.handleSelectQuiz(null)}
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
