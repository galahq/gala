/**
 * @providesModule Deployment
 * 
 */

import * as React from 'react'
import { map } from 'ramda'

import QuizSelector from './QuizSelector'
import QuizDetails from './QuizDetails'
import Toolbar from './Toolbar'

import { Intent } from '@blueprintjs/core'
import Toaster from 'shared/Toaster'


import { Orchard } from 'shared/orchard'
import { chooseContentItem } from 'shared/lti'
import { validatedQuestions } from 'suggested_quizzes/helpers'




class Deployment extends React.Component {
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

    if (!customQuestions[`${selectedQuizId}`]) {
      return false
    }

    const validatedState = {
      ...state,
      customQuestions: {
        ...customQuestions,
        [`${selectedQuizId}`]: validatedQuestions(
          customQuestions[`${selectedQuizId}`]
        ),
      },
    }
    this.setState(validatedState)
    return !validatedState.customQuestions[`${selectedQuizId}`].some(
      (question) => question.hasError
    )
  }

  _displayToast = (error, intent = Intent.DANGER) => {
    Toaster.show({
      message: error,
      intent,
    })
  }

  handleSelectQuiz = (quizId) => {
    this.setState({ selectedQuizId: quizId })
  }

  handleTogglePretest = () => {
    this.setState((state) => ({
      ...state,
      answersNeeded: state.answersNeeded === 1 ? 2 : 1,
    }))
  }

  handleTogglePosttest = () => {
    this.setState((state) => ({
      ...state,
      answersNeeded: state.answersNeeded > 0 ? 0 : 1,
    }))
  }

  handleChangeCustomQuestions = (
    quizId,
    customQuestions
  ) => {
    this.setState((state) => ({
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
        .then(({ redirect }) => {
          const { returnUrl, returnData, caseData } = this.props
          if (returnUrl != null && returnData != null) {
            chooseContentItem(returnUrl, returnData, caseData.callbackUrl)
          } else {
            window.location = redirect
          }
        })
        .catch((e) => this._displayToast(e.message))
    } else {
      this._displayToast(
        'Please ensure that there are no blank questions and that you have chosen correct answers for all questions.'
      )
    }
  }

  constructor (props) {
    super(props)

    const customQuestions = map(
      (quiz) => quiz.customQuestions,
      props.suggestedQuizzes
    )
    this.state = {
      selectedQuizId: props.selectedQuizId,
      answersNeeded: props.answersNeeded || 2,
      customQuestions,
    }
  }

  render () {
    const { caseData, suggestedQuizzes } = this.props
    const { selectedQuizId, customQuestions, answersNeeded } = this.state
    return (
      <>
        <div className="bp6-dark" style={{ padding: '0 12px' }}>
          {selectedQuizId == null ? (
            <QuizSelector
              suggestedQuizzes={suggestedQuizzes}
              customQuestions={customQuestions}
              selectedQuizId={selectedQuizId}
              onSelect={this.handleSelectQuiz}
              onChangeCustomQuestions={this.handleChangeCustomQuestions}
            />
          ) : (
            <QuizDetails
              quiz={suggestedQuizzes[`${selectedQuizId}`]}
              customQuestions={customQuestions[`${selectedQuizId}`]}
              onChangeCustomQuestions={(newCustomQuestions) =>
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
          caseData={caseData}
          withPretest={answersNeeded === 2}
          withPosttest={answersNeeded > 0}
          onTogglePretest={this.handleTogglePretest}
          onTogglePosttest={this.handleTogglePosttest}
          onSubmit={this.handleSubmit}
        />
      </>
    )
  }
}

export default Deployment
