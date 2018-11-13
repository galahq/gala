/**
 * @flow
 */

import { map } from 'ramda'

import type { DraftQuestion } from 'redux/state'

export const questionHasError = ({
  content,
  options,
  correctAnswer,
}: DraftQuestion) => {
  if (!content) return true

  if (options.length === 0) return correctAnswer === '' || correctAnswer == null

  if (options.some(o => o === '')) return true

  return !options.some(o => o === correctAnswer)
}

export const validatedQuestions: (DraftQuestion[]) => DraftQuestion[] = map(
  (question: DraftQuestion) => ({
    ...question,
    hasError: questionHasError(question),
  })
)
