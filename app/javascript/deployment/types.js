/**
 * @flow
 */

export type Question = {
  id: ?number,
  content: string,
  options: string[],
  correctAnswer: string,
  hasError: boolean,
}

export type ID = number | 'new'

export type Quiz = {
  id: ID,
  questions: Question[],
  customQuestions: Question[],
  customized: boolean,
}
