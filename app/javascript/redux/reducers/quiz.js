/**
 * @providesModule quiz
 * @flow
 */

import type { QuizState } from 'redux/state'

const getInitialQuizState = (): QuizState =>
  (window.caseData.quiz: QuizState) || {
    needsPretest: false,
    questions: [],
  }

export default function quiz (state: QuizState = getInitialQuizState()) {
  return state
}
