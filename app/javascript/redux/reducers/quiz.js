/**
 * @providesModule quiz
 * @flow
 */

import type { QuizState } from 'redux/state'

import type { RecordQuizSubmissionAction } from 'redux/actions'

const getInitialQuizState = (): QuizState =>
  (window.caseData.quiz: QuizState) || {
    needsPretest: false,
    needsPosttest: false,
    questions: [],
  }

type Action = RecordQuizSubmissionAction

export default function quiz (
  state: QuizState = getInitialQuizState(),
  action: Action
) {
  switch (action.type) {
    case 'RECORD_QUIZ_SUBMISSION':
      return {
        ...state,
        ...action.data,
      }

    default:
      return state
  }
}
