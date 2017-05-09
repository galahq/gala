/**
 * @flow
 */

import { Record, List } from 'immutable'

export class Question
  extends Record({ content: '', options: List(), answer: '' }, 'Question') {
  getContent () {
    return this.get('content')
  }

  getOptions () {
    return this.get('options')
  }

  getOption (i: number) {
    return this.getOptions().get(i)
  }

  getAnswer () {
    return this.get('answer')
  }
}

export type ID = number | 'new'

export type Quiz = {
  id: ID,
  questions: Question[],
}
