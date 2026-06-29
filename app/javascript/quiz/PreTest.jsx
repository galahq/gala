/**
 * @providesModule PreTest
 * 
 */

import React from 'react'
import { injectIntl, FormattedMessage } from 'react-intl'

import { Route } from 'react-router-dom'
import { Dialog, Button } from '@blueprintjs/core'

import CaseOverview from 'overview/CaseOverview'
import { providesQuiz } from './Quiz'
import Question from './Question'
import Tracker from 'utility/Tracker'



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
}) => {
  return (
    <div style={{ height: '100%' }}>
      <Route component={CaseOverview} />
      <Dialog
        className="bp6-dark"
        isOpen={!!match}
        title={intl.formatMessage({
          id: 'submissions.new.beforeYouGetStarted',
        })}
        style={{ top: '10%', width: '100%', maxWidth: 800 }}
        onClose={e => {
          history.replace('/')
        }}
      >
        <div className="bp6-dialog-body">
          <p>
            <FormattedMessage id="submissions.new.pleaseAnswer" />
          </p>

          <div className="bp6-card">
            {questions.map((q) => (
              <Question
                selectedAnswer={answers[q.id]}
                key={q.id}
                {...q}
                onChange={(e) => onChange(q.id, e)}
              />
            ))}
          </div>
        </div>

        <div className="bp6-dialog-footer">
          <div className="bp6-dialog-footer-actions">
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
            pre_or_post: 'pre',
            quiz_id: quizId,
          }}
        />
      </Dialog>
    </div>
  )
}

export default providesQuiz(injectIntl(PreTest))
