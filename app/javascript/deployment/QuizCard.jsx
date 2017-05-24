/**
 * @providesModule QuizCard
 * @flow
 */

import React from 'react'
import styled from 'styled-components'

import { NonIdealState } from '@blueprintjs/core'

import { acceptKeyboardClick } from 'shared/keyboard'

import type { ID, Quiz, Question } from './types'

type Params = Quiz & { onClick: (quizId: ID) => void }
const QuizCard = ({ id, questions, onClick }: Params) => (
  <div
    className="pt-card pt-elevation-1 pt-interactive"
    style={{ backgroundColor: '#446583AA' }}
    tabIndex="0"
    role="button"
    onClick={() => onClick(id)}
    onKeyPress={acceptKeyboardClick(() => onClick(id))}
  >
    {questions.length > 0
      ? <ol>
        {questions.map((question: Question, i: number) => (
          <li key={i}>
            {question.content}
            <QuestionType
              className={
                  `pt-icon-standard pt-icon-${question.options.length > 0 ? 'properties' : 'comment'}`
                }
            />
          </li>
          ))}
      </ol>
      : <NonIdealState title="Custom Assessment" visual="edit" />}
  </div>
)

export default QuizCard

export const QuestionType = styled.span`
  margin-left: 0.5em;
  color: #FFFFFF99;
`
