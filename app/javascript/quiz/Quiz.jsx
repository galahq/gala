/**
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'

import { submitQuiz } from 'redux/actions'

import type { State } from 'redux/state'

function mapStateToProps (state: State) {
  const { id, questions, needsPretest, needsPosttest } = state.quiz
  const { reader } = state.caseData
  return {
    isInstructor:
      !!reader &&
      !!reader.enrollment &&
      reader.enrollment.status === 'instructor',
    submissionNeeded: needsPretest || needsPosttest,
    id,
    questions,
  }
}

import type { Question } from 'redux/state'

type QuizProps = {
  id: number,
  questions: Question[],
  submissionNeeded: boolean,
  submitQuiz: typeof submitQuiz,
  answers: QuizState,
  isInstructor: boolean,
}
type QuizState = { [questionId: string]: string }
type QuizDelegateProps = {
  canSubmit: boolean,
  onChange: (questionId: string, e: SyntheticInputEvent<*>) => void,
  onSubmit: (e: ?SyntheticEvent<*>) => Promise<any>,
}

export type QuizProviderProps = QuizDelegateProps & QuizProps & QuizState

export function providesQuiz<P> (
  QuizPresenter: React$ComponentType<{|
    ...QuizProviderProps,
    ...P,
  |}>
) {
  class QuizProvider extends React.Component<
    *,
    { submitting: boolean, quizState: QuizState }
  > {
    state = { submitting: false, quizState: {}}

    _canSubmit = () => {
      const { submissionNeeded, isInstructor, questions } = this.props
      const { submitting, quizState } = this.state
      if (submitting) return false
      if (!submissionNeeded) return false
      if (isInstructor) return false

      return questions.map(x => x.id).every(x => {
        const answer = quizState[x]
        return answer && answer.trim().length > 0
      })
    }

    handleChange = (questionId: string, e: SyntheticInputEvent<*>) => {
      const value = e.target.value
      this.setState(state => ({
        quizState: {
          ...state.quizState,
          [questionId]: value,
        },
      }))
    }

    handleSubmit = () => {
      this.setState({ submitting: true })
      return this.props
        .submitQuiz(this.props.id, this.state.quizState)
        .then(() => this.setState({ submitting: false }))
    }

    render () {
      return (
        <QuizPresenter
          answers={this.state.quizState}
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
