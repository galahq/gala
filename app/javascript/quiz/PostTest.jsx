/**
 * @providesModule PostTest
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { injectIntl, FormattedMessage } from 'react-intl'
import { values } from 'ramda'

import { Button, Intent } from '@blueprintjs/core'

import Sidebar from 'elements/Sidebar'
import { providesQuiz } from './Quiz'
import Question from './Question'
import { AccessibleAlert, LabelForScreenReaders } from 'utility/A11y'
import Tracker from 'utility/Tracker'

import { Orchard } from 'shared/orchard'

import type { IntlShape } from 'react-intl'
import type { Question as QuestionT } from 'redux/state'
import type { QuizProviderProps } from './Quiz'

type Quiz = {
  id: string,
  questions: {
    id: string,
    content: string,
    correctAnswer: string,
    options: string[],
  }[],
}

type Submissions = {
  submissions: {
    [string]: {
      id: string,
      readerId: string,
      quizId: string,
      createdAt: Date,
      answersByQuestionId: {
        [string]: {
          id: string,
          content: string,
          correct: boolean,
          createdAt: Date,
        },
      },
    },
  },
}

type Props = QuizProviderProps & { intl: IntlShape }
class PostTest extends React.Component<
  Props,
  {
    selectedAnswers: string[],
    correctAnswers: string[],
  }
> {
  state = {
    selectedAnswers: [],
    correctAnswers: [],
  }

  handleSubmit = (e: ?SyntheticEvent<*>) => {
    this.props.onSubmit(e).then(this._loadCorrectAnswers)
  }

  componentDidMount () {
    this._loadCorrectAnswers()
  }

  render () {
    const {
      answers,
      canSubmit,
      id: quizId,
      onChange,
      questions,
      intl,
    } = this.props
    const { correctAnswers, selectedAnswers } = this.state
    const needsResponse = correctAnswers.length === 0
    return (
      <div className="window">
        <Sidebar />
        <main>
          {needsResponse && (
            <Tracker
              timerState="RUNNING"
              targetKey={`post_test`}
              targetParameters={{
                name: 'read_quiz',
                pre_or_post: 'post',
                quiz_id: quizId,
              }}
            />
          )}

          <h1
            style={{
              color: 'white',
              fontSize: '1.3em',
              margin: '1em 0 0.75em',
            }}
          >
            <FormattedMessage id="submissions.new.postCaseQuiz" />
          </h1>
          <div
            className="bp3-card"
            style={{ backgroundColor: '#EBEAE4', maxWidth: '45em' }}
          >
            <Instructions needsResponse={needsResponse}>
              {needsResponse ? (
                <div>
                  <h5>
                    <FormattedMessage id="submissions.new.checkYourUnderstanding" />
                  </h5>
                  <FormattedMessage id="submissions.new.pleaseTakeThisAfterEngagingWithAllElements" />
                </div>
              ) : (
                <AccessibleAlert>
                  <FormattedMessage id="submissions.show.thankYou" />{' '}
                  <span aria-hidden>
                    <FormattedMessage id="submissions.show.correctAnswersAreBelow" />
                  </span>
                  <LabelForScreenReaders>
                    <ol>
                      {questions.map((q, i) => (
                        <li key={i}>
                          <FormattedMessage
                            id="quizzes.show.theCorrectAnswerIs"
                            values={{
                              question: q.content,
                              answer: correctAnswers[i],
                            }}
                          />
                        </li>
                      ))}
                    </ol>
                  </LabelForScreenReaders>
                </AccessibleAlert>
              )}
            </Instructions>
            {questions.map((q: QuestionT, i) => (
              <Question
                selectedAnswer={answers[q.id] || selectedAnswers[i]}
                correctAnswer={correctAnswers[i]}
                key={q.id}
                {...q}
                onChange={(e: SyntheticInputEvent<*>) => onChange(q.id, e)}
              />
            ))}
            <Button
              disabled={!canSubmit}
              intent={Intent.PRIMARY}
              text={intl.formatMessage({ id: 'helpers.submit.submit' })}
              onClick={this.handleSubmit}
            />
          </div>
        </main>
      </div>
    )
  }

  _loadCorrectAnswers = () => {
    const { id } = this.props
    Orchard.harvest(`quizzes/${id}`).then((quiz: Quiz) =>
      Orchard.harvest(`quizzes/${id}/submissions`).then(
        ({ submissions }: Submissions) => {
          const lastSubmission = values(submissions).reduce((max, submission) =>
            max.createdAt >= submission.createdAt ? max : submission
          )

          this.setState({
            correctAnswers: quiz.questions.map(q => q.correctAnswer),
            selectedAnswers: quiz.questions.map(q => {
              const answers = lastSubmission.answersByQuestionId[q.id]
              if (answers == null) return ''
              return answers.content
            }),
          })
        }
      )
    )
  }
}

export default providesQuiz(injectIntl(PostTest))

const Instructions = styled.div.attrs({
  className: ({ needsResponse }) =>
    `bp3-callout${needsResponse ? '' : ' bp3-intent-success'}`,
})`
  margin-bottom: 1em;
`
