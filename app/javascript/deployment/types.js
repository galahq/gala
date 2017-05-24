/**
 * @flow
 */

import { Record, List } from 'immutable'

export type QuestionSpec = {
  id: ?number,
  content: string,
  options: List<string>,
  correctAnswer: string,
  hasError: boolean,
}

export class Question
  extends Record(
    ({
      id: null,
      content: '',
      options: List(),
      correctAnswer: '',
      hasError: false,
    }: QuestionSpec),
    'Question'
  ) {
  getId: () => ID
  getId () {
    return this.get('id')
  }

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
  customQuestions: Question[],
  customized: boolean,
}
