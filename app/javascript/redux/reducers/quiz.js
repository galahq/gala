/**
 * @providesModule quiz
 * @flow
 */

import type { QuizState } from 'redux/state'

export default function quiz (
  state: QuizState = (window.caseData.quiz: QuizState)
) {
  return state
}
