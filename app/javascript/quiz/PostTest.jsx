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
  handleChange,
  handleSubmit,
  questions,
}: Props) => {
  return (
    <div className="window">
      <Sidebar />
      <main>
        <h1
          style={{ color: 'white', fontSize: '1.3em', margin: '1em 0 0.75em' }}
        >
          Check your understanding (I18n)
        </h1>
        <div
          className="pt-card pt-dar"
          style={{ backgroundColor: '#EBEAE4', maxWidth: '35em' }}
        >
          {questions.map((q: QuestionT) => (
            <Question
              selectedAnswer={answers[q.id]}
              key={q.id}
              {...q}
              handleChange={(e: SyntheticInputEvent) => handleChange(q.id, e)}
            />
          ))}
          <Tooltip
            isDisabled={canSubmit}
            content="Please answer all the questions (I18n)"
            position={Position.TOP}
          >
            <Button
              disabled={!canSubmit}
              intent={Intent.PRIMARY}
              text="Submit"
              onClick={handleSubmit}
            />
          </Tooltip>
        </div>
      </main>
    </div>
  )
}

export default providesQuiz(PostTest)
