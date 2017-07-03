/**
 * @providesModule PostTest
 * @flow
 */

import React from 'react'

import { Button, Tooltip, Position, Intent } from '@blueprintjs/core'

import Sidebar from 'elements/Sidebar'
import { providesQuiz } from './Quiz'
import Question from './Question'

import type { Question as QuestionT } from 'redux/state'
import type { QuizProviderProps } from './Quiz'

type Props = QuizProviderProps
const PostTest = ({
  answers,
  canSubmit,
  onChange,
  onSubmit,
  questions,
}: Props) => {
  return (
    <div className="window">
      <Sidebar />
      <main>
        <h1
          style={{ color: 'white', fontSize: '1.3em', margin: '1em 0 0.75em' }}
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
          {questions.map((q: QuestionT) =>
            <Question
              selectedAnswer={answers[q.id]}
              key={q.id}
              {...q}
              onChange={(e: SyntheticInputEvent) => onChange(q.id, e)}
            />
          )}
          <Tooltip
            isDisabled={canSubmit}
            content="Please answer all the questions"
            position={Position.TOP}
          >
            <Button
              disabled={!canSubmit}
              intent={Intent.PRIMARY}
              text="Submit"
              onClick={onSubmit}
            />
          </Tooltip>
        </div>
      </main>
    </div>
  )
}

export default providesQuiz(PostTest)
