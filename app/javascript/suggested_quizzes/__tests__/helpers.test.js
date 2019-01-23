/**
 * @flow
 */

import { questionHasError, validatedQuestions } from '../helpers'

describe('questionHasError', () => {
  test.each`
    question                                                                      | hasError
    ${{ id: null, content: '', options: [], correctAnswer: '' }}                  | ${true}
    ${{ id: null, content: '', options: ['A', 'B'], correctAnswer: 'A' }}         | ${true}
    ${{ id: null, content: 'What is?', options: [], correctAnswer: '' }}          | ${true}
    ${{ id: null, content: 'What is?', options: [], correctAnswer: 'IDK' }}       | ${false}
    ${{ id: null, content: 'What is?', options: ['A', 'B'], correctAnswer: '' }}  | ${true}
    ${{ id: null, content: 'What is?', options: ['A', 'B'], correctAnswer: 'C' }} | ${true}
    ${{ id: null, content: 'What is?', options: ['A', 'B'], correctAnswer: 'A' }} | ${false}
    ${{ id: null, content: 'What is?', options: [''], correctAnswer: '' }}        | ${true}
  `(
    'returns $hasError when question is { content: $question.content, options: $question.options, correctAnswer: $question.correctAnswer }',
    ({ question, hasError }) => {
      expect(questionHasError(question)).toEqual(hasError)
    }
  )
})

describe('validatedQuestions', () => {
  test('works', () => {
    const validated = validatedQuestions([
      { id: null, content: 'What?', options: ['A', 'B'], correctAnswer: 'A' },
      { id: null, content: '', options: [], correctAnswer: '' },
    ])

    expect(validated.map(q => q.hasError)).toEqual([false, true])
  })
})
