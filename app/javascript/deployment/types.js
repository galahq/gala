/**
 * @flow
 */
import type { DraftQuestion } from 'redux/state'
export type { DraftQuestion } from 'redux/state'

export type ID = number | 'new'

export type CustomizedQuiz = {
  id: ID,
  questions: DraftQuestion[],
  customQuestions: DraftQuestion[],
  customized: boolean,
}
