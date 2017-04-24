/* @flow */

import type { QuizState } from 'redux/state'

export default function quiz (state: QuizState) {
  return {
    needsPreTest: true,
    questions: [
      {
        id: '1',
        content: 'What do you think is the difference between us and them?',
        options: [
          'All forms of the object are equal',
          'Barely two of the choices matter',
          'Case in point, it’s the same',
          'Dare to choose this one',
        ],
      },
      {
        id: '2',
        content: 'What is your favorite color?',
        options: ['Red', 'Blue', 'Yellow', 'Green'],
      },
      {
        id: '3',
        content: 'How would you explain epistemology to a fourth grader?',
      },
    ],
  }
}
