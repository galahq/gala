/**
 *
 */

import * as React from 'react'
import { connect } from 'react-redux'

import { submitQuiz } from 'redux/actions'



function mapStateToProps (state) {
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



export function providesQuiz (
  QuizPresenter) {
  class QuizProvider extends React.Component {
    state = { submitting: false, quizState: {}}

    _canSubmit = () => {
      const { submissionNeeded, isInstructor, questions } = this.props
      const { submitting, quizState } = this.state
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

    handleChange = (questionId, e) => {
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

  return connect(
    mapStateToProps,
    { submitQuiz }
  )(QuizProvider)
}
