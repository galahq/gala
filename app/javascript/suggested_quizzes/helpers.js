/**
 * @flow
 */

import { map } from 'ramda'

import type { DraftQuestion } from 'redux/state'

const questionHasError = (question: DraftQuestion) =>
  !question.content ||
  (question.options.length === 0
    ? question.correctAnswer === '' || question.correctAnswer == null
    : !question.options.some(
      (option: string) => option === question.correctAnswer
    ))

export const validatedQuestions: (DraftQuestion[]) => DraftQuestion[] = map(
  (question: DraftQuestion) => ({
    ...question,
    hasError: questionHasError(question),
  })
)
