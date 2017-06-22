/**
 * @providesModule Quiz
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'

import { submitQuiz } from 'redux/actions'

import type { State } from 'redux/state'

function mapStateToProps (state: State) {
  if (!state.quiz.needsPretest && !state.quiz.needsPosttest) {
    throw new Error('trying to present quiz when not needed')
  }

  const { id, questions } = state.quiz
  const { reader } = state.caseData
  return {
    isInstructor:
      !!reader &&
        !!reader.enrollment &&
        reader.enrollment.status === 'instructor',
    id,
    questions,
  }
}

import type { Question } from 'redux/state'

type QuizProps = {
  id: number,
  questions: Question[],
  submitQuiz: typeof submitQuiz,
  answers: QuizState,
  isInstructor: boolean,
}
type QuizState = { [questionId: string]: string }
type QuizDelegateProps = {
  canSubmit: boolean,
  onChange: (questionId: string, e: SyntheticInputEvent) => void,
  onSubmit: (e: SyntheticMouseEvent) => void,
}

export type QuizProviderProps = QuizDelegateProps & QuizProps & QuizState

export function providesQuiz (
  QuizPresenter: <P: { [string]: any }>(props: P) => ?React$Element<any>
) {
  class QuizProvider extends React.Component {
    props: QuizProps
    state: QuizState = {}

    _canSubmit = () => {
      const { isInstructor, questions } = this.props
      if (isInstructor) return false

      return questions.map(x => x.id).every(x => {
        const answer = this.state[x]
        return answer && answer.length > 0
      })
    }

    handleChange = (questionId: string, e: SyntheticInputEvent) => {
      const value = e.target.value
      this.setState((state: QuizState) => ({
        ...state,
        [questionId]: value,
      }))
    }

    handleSubmit = () => {
      this.props.submitQuiz(this.props.id, this.state)
    }

    render () {
      return (
        <QuizPresenter
          answers={this.state}
          canSubmit={this._canSubmit()}
          {...this.props}
          onChange={this.handleChange}
          onSubmit={this.handleSubmit}
        />
      )
    }
  }

  return connect(mapStateToProps, { submitQuiz })(QuizProvider)
}
