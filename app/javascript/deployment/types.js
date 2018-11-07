/**
 * @flow
 */

export type DraftQuestion = {
  id: ?string,
  content: string,
  options: string[],
  correctAnswer: string,
  hasError?: boolean,
}

export type ID = number | 'new'

export type CustomizedQuiz = {
  id: ID,
  questions: DraftQuestion[],
  customQuestions: DraftQuestion[],
  customized: boolean,
}
