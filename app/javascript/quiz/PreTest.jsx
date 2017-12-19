/**
 * @providesModule PreTest
 * @flow
 */

import React from 'react'

import { Route } from 'react-router-dom'
import { Dialog, Button } from '@blueprintjs/core'
import type { ContextRouter } from 'react-router-dom'

import CaseOverview from 'overview/CaseOverview'
import { providesQuiz } from './Quiz'
import Question from './Question'
import Tracker from 'utility/Tracker'

import type { Question as QuestionT } from 'redux/state'
import type { QuizProviderProps } from './Quiz'

type Props = ContextRouter & QuizProviderProps
const PreTest = ({
  answers,
  canSubmit,
  history,
  id: quizId,
  match,
  onChange,
  onSubmit,
  questions,
}: Props) => {
  return (
    <div style={{ height: '100%' }}>
      <Route component={CaseOverview} />
      <Dialog
        className="pt-dark"
        isOpen={!!match}
        title="Before you get started"
        style={{ top: '10%', width: '100%', maxWidth: 800 }}
        onClose={e => {
          history.replace('/')
        }}
      >
        <div className="pt-dialog-body">
          <p>
            Please answer the following questions to demonstrate your current
            level of knowledge.
          </p>

          <div className="pt-card">
            {questions.map((q: QuestionT) => (
              <Question
                selectedAnswer={answers[q.id]}
                key={q.id}
                {...q}
                onChange={(e: SyntheticInputEvent<*>) => onChange(q.id, e)}
              />
            ))}
          </div>
        </div>

        <div className="pt-dialog-footer">
          <div className="pt-dialog-footer-actions">
            <Button disabled={!canSubmit} text="Submit" onClick={onSubmit} />
          </div>
        </div>

        <Tracker
          timerState="RUNNING"
          targetKey={`pre_test`}
          targetParameters={{
            name: 'read_quiz',
            preOrPost: 'pre',
            quizId,
          }}
        />
      </Dialog>
    </div>
  )
}

export default providesQuiz(PreTest)
