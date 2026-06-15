/**
 *
 */

import { Orchard } from 'shared/orchard'


export function submitQuiz (
  id,
  answers
) {
  return async (dispatch) => {
    const params = {
      answers: Object.keys(answers).map((key) => ({
        questionId: key,
        content: answers[key],
      })),
    }
    const necessity = (await Orchard.graft(
      `quizzes/${id}/submissions`,
      params
    ))
    dispatch(recordQuizSubmission(necessity))
  }
}

function recordQuizSubmission (
  data
) {
  return { type: 'RECORD_QUIZ_SUBMISSION', data }
}
