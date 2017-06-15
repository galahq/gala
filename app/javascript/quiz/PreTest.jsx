/**
 * @providesModule PreTest
 * @flow
 */

import React from 'react'

import { Route } from 'react-router-dom'
import { Dialog, Button, Tooltip, Position } from '@blueprintjs/core'
import type { RouteProps } from 'react-router-dom'

import CaseOverview from 'overview/CaseOverview'
import { providesQuiz } from './Quiz'
import Question from './Question'

import type { Question as QuestionT } from 'redux/state'
import type { QuizProviderProps } from './Quiz'

type Props = RouteProps & QuizProviderProps
const PreTest = ({
  answers,
  canSubmit,
  onChange,
  onSubmit,
  history,
  match,
  questions,
}: Props) => {
  return (
    <div style={{ height: '100%' }}>
      <Route component={CaseOverview} />
      <Dialog
        className="pt-dark"
        isOpen={!!match}
        title="Before you get started"
        style={{ top: '10%', width: 800 }}
        onClose={() => {
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
                onChange={(e: SyntheticInputEvent) => onChange(q.id, e)}
              />
            ))}
          </div>
        </div>

        <div className="pt-dialog-footer">
          <div className="pt-dialog-footer-actions">
            <Tooltip
              isDisabled={canSubmit}
              content="Please answer all the questions"
              position={Position.TOP}
            >
              <Button disabled={!canSubmit} text="Submit" onClick={onSubmit} />
            </Tooltip>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default providesQuiz(PreTest)
