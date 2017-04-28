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
  return {
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
}
type QuizState = { [questionId: string]: string }
type QuizDelegateProps = {
  canSubmit: boolean,
  handleChange: (questionId: string, e: SyntheticInputEvent) => void,
  handleSubmit: (e: SyntheticMouseEvent) => void,
}

export type QuizProviderProps = QuizDelegateProps & QuizProps & QuizState

export function providesQuiz (
  QuizPresenter: <P: { [string]: any }>(props: P) => ?React$Element<any>
) {
  class QuizProvider extends React.Component {
    props: QuizProps
    state: QuizState

    _handleChange: (questionId: string, e: SyntheticInputEvent) => void
    _handleSubmit: (e: SyntheticMouseEvent) => void

    constructor (props: QuizProps) {
      super(props)
      this.state = {}

      this._handleChange = (questionId, e) => {
        const value = e.target.value
        this.setState((state: QuizState) => ({
          ...state,
          [questionId]: value,
        }))
      }

      this._handleSubmit = () => {
        this.props.submitQuiz(this.props.id, this.state)
      }
    }

    render () {
      return (
        <QuizPresenter
          answers={this.state}
          canSubmit={this.props.questions.map(x => x.id).every(x => {
            const answer = this.state[x]
            return answer && answer.length > 0
          })}
          {...this.props}
          handleChange={this._handleChange}
          handleSubmit={this._handleSubmit}
        />
      )
    }
  }

  return connect(mapStateToProps, { submitQuiz })(QuizProvider)
}
