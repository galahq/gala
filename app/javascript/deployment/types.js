/**
 * @flow
 */

import { Record, List } from 'immutable'

export class Question
  extends Record(
    { content: '', options: List(), correctAnswer: '', hasError: false },
    'Question'
  ) {
  getContent: () => string
  getContent () {
    return this.get('content')
  }

  getOptions: () => List<string>
  getOptions () {
    return this.get('options')
  }

  getOption: (i: number) => string
  getOption (i: number) {
    return this.getOptions().get(i)
  }

  getAnswer: () => string
  getAnswer () {
    return this.get('correctAnswer')
  }

  hasError: () => boolean
  hasError () {
    return this.get('hasError')
  }
}

export type ID = number | 'new'

export type Quiz = {
  id: ID,
  questions: Question[],
}
