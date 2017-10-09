/**
 * @providesModule PostTest
 * @flow
 */

import React, { Component } from 'react'

import { Button, Tooltip, Position, Intent } from '@blueprintjs/core'

import Sidebar from 'elements/Sidebar'
import { providesQuiz } from './Quiz'
import Question from './Question'

import { Orchard } from 'shared/orchard'

import type { Question as QuestionT } from 'redux/state'
import type { QuizProviderProps } from './Quiz'

type Submission = {
  answersByQuestionId: {
    [string]: {
      id: string,
      quizId: string,
      content: string,
      correct: boolean,
      createdAt: Date,
    }[],
  },
}

type Props = QuizProviderProps
class PostTest extends Component {
  props: Props
  state = {
    selectedAnswers: ([]: string[]),
    correctAnswers: ([]: string[]),
  }

  handleSubmit = e => {
    this.props.onSubmit(e).then(this._loadCorrectAnswers)
  }

  componentDidMount () {
    this._loadCorrectAnswers()
  }

  render () {
    const { answers, canSubmit, onChange, questions } = this.props
    const { correctAnswers, selectedAnswers } = this.state
    return (
      <div className="window">
        <Sidebar />
        <main>
          <h1
            style={{
              color: 'white',
              fontSize: '1.3em',
              margin: '1em 0 0.75em',
            }}
          >
            Post-case quiz
          </h1>
          <div
            className="pt-card"
            style={{ backgroundColor: '#EBEAE4', maxWidth: '45em' }}
          >
            <div className="pt-callout" style={{ marginBottom: '1em' }}>
              <h5>Check your understanding</h5>
              After you have engaged with all elements of the case, please take
              this post-test to check your understanding.
            </div>
            {questions.map((q: QuestionT, i) => (
              <Question
                selectedAnswer={answers[q.id] || selectedAnswers[i]}
                correctAnswer={correctAnswers[i]}
                key={q.id}
                {...q}
                onChange={(e: SyntheticInputEvent) => onChange(q.id, e)}
              />
            ))}
            <Tooltip
              isDisabled={canSubmit}
              content="Please answer all the questions"
              position={Position.TOP}
            >
              <Button
                disabled={!canSubmit}
                intent={Intent.PRIMARY}
                text="Submit"
                onClick={this.handleSubmit}
              />
            </Tooltip>
          </div>
        </main>
      </div>
    )
  }

  _loadCorrectAnswers = () => {
    const { id } = this.props
    Orchard.harvest(`quizzes/${id}`).then(quiz =>
      Orchard.harvest(
        `quizzes/${id}/submissions`
      ).then((submission: Submission) =>
        this.setState({
          correctAnswers: quiz.questions.map(q => q.correctAnswer),
          selectedAnswers: quiz.questions.map(q => {
            const answers = submission.answersByQuestionId[(q.id: string)]
            if (answers == null) return ''
            return answers.pop().content
          }),
        })
      )
    )
  }
}

export default providesQuiz(PostTest)
