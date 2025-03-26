/**
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'

import { submitQuiz } from 'redux/actions'

import type { State } from 'redux/state'

import type { Question } from 'redux/state'

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

type QuizProps = {
  id: number,
  questions: Question[],
  submissionNeeded: boolean,
  submitQuiz: typeof submitQuiz,
  answers: QuizState,
  isInstructor: boolean,
}

type QuizState = { [questionId: string]: string }

// this is what is prompting the pretest
type QuizDelegateProps = {
  canSubmit: boolean,
  onChange: (questionId: string, e: SyntheticInputEvent<*>) => void,
  onSubmit: (e: ?SyntheticEvent<*>) => Promise<any>,
}

export type QuizProviderProps = QuizDelegateProps &
  QuizProps & { answers: QuizState }

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
      // this is what enables or disables the submission button
      const { submissionNeeded, isInstructor, questions } = this.props
      const { submitting, quizState } = this.state
      console.log({ submissionNeeded, isInstructor, questions, submitting, quizState })
      if (submitting) return false
      if (!submissionNeeded) return false
      if (isInstructor) return false

      return questions
        .map(x => x.id)
        .every(x => {
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
        // $FlowFixMe
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

  // $FlowFixMe
  return connect(
    mapStateToProps,
    { submitQuiz }
  )(QuizProvider)
}
