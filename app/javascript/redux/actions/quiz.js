/**
 * @flow
 */

import { Orchard } from 'shared/orchard'

import type { ThunkAction, Dispatch } from 'redux/actions'
import type { QuizNecessity } from 'redux/state'

export function submitQuiz (
  id: number,
  answers: { [string]: string }
): ThunkAction {
  return async (dispatch: Dispatch) => {
    const params = {
      answers: Object.keys(answers).map((key: string) => ({
        questionId: key,
        content: answers[key],
      })),
    }
    const necessity = (await Orchard.graft(
      `quizzes/${id}/submissions`,
      params
    ): QuizNecessity<boolean, boolean>)
    dispatch(recordQuizSubmission(necessity))
  }
}

export type RecordQuizSubmissionAction = {
  type: 'RECORD_QUIZ_SUBMISSION',
  data: QuizNecessity<boolean, boolean>,
}
function recordQuizSubmission (
  data: QuizNecessity<boolean, boolean>
): RecordQuizSubmissionAction {
  return { type: 'RECORD_QUIZ_SUBMISSION', data }
}
