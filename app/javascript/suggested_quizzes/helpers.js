/**
 * 
 */

import { map } from 'ramda'


export const questionHasError = ({
  content,
  options,
  correctAnswer,
}) => {
  if (!content) return true

  if (options.length === 0) return correctAnswer === '' || correctAnswer == null

  if (options.some(o => o === '')) return true

  return !options.some(o => o === correctAnswer)
}

export const validatedQuestions = map(
  (question) => ({
    ...question,
    hasError: questionHasError(question),
  })
)
