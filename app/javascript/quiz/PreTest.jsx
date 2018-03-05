/**
 * @providesModule PreTest
 * @flow
 */

import React from 'react'
import { injectIntl, FormattedMessage } from 'react-intl'

import { Route } from 'react-router-dom'
import { Dialog, Button } from '@blueprintjs/core'

import CaseOverview from 'overview/CaseOverview'
import { providesQuiz } from './Quiz'
import Question from './Question'
import Tracker from 'utility/Tracker'

import type { ContextRouter } from 'react-router-dom'
import type { IntlShape } from 'react-intl'

import type { Question as QuestionT } from 'redux/state'
import type { QuizProviderProps } from './Quiz'

type Props = ContextRouter & QuizProviderProps
const PreTest = ({
  answers,
  canSubmit,
  history,
  id: quizId,
  intl,
  match,
  onChange,
  onSubmit,
  questions,
}: Props & { intl: IntlShape }) => {
  return (
    <div style={{ height: '100%' }}>
      <Route component={CaseOverview} />
      <Dialog
        className="pt-dark"
        isOpen={!!match}
        title={intl.formatMessage({
          id: 'submissions.new.beforeYouGetStarted',
        })}
        style={{ top: '10%', width: '100%', maxWidth: 800 }}
        onClose={e => {
          history.replace('/')
        }}
      >
        <div className="pt-dialog-body">
          <p>
            <FormattedMessage id="submissions.new.pleaseAnswer" />
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
            <Button
              disabled={!canSubmit}
              text={intl.formatMessage({ id: 'helpers.submit.submit' })}
              onClick={onSubmit}
            />
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

export default providesQuiz(injectIntl(PreTest))
