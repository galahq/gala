/**
 * @providesModule QuizCard
 * @flow
 */

import React from 'react'
import styled from 'styled-components'

import { NonIdealState } from '@blueprintjs/core'

import { acceptKeyboardClick } from 'shared/keyboard'
import { SectionTitle } from './QuizDetails'

import type { ID, Quiz, Question as QuestionT } from './types'

type Params = Quiz & { onClick: (quizId: ID) => void }
const QuizCard = ({ id, questions, customQuestions, onClick }: Params) => (
  <div
    className="pt-card pt-elevation-1 pt-interactive"
    style={{ backgroundColor: '#446583AA' }}
    tabIndex="0"
    role="button"
    onClick={() => onClick(id)}
    onKeyPress={acceptKeyboardClick(() => onClick(id))}
  >
    {questions.length > 0 || customQuestions.length > 0
      ? <ol>
        <Questions questions={questions} />
        <Questions
          questions={customQuestions}
          sectionTitle="Custom Questions"
        />
      </ol>
      : <NonIdealState title="Custom Assessment" visual="edit" />}
  </div>
)

export default QuizCard

const Questions = ({
  questions,
  sectionTitle,
}: {
  questions: QuestionT[],
  sectionTitle?: string,
}) =>
  questions.length > 0 &&
  <div>
    <SectionTitle>{sectionTitle}</SectionTitle>
    {questions.map((question: QuestionT, i: number) => (
      <li key={i}>
        {question.content}
        <QuestionType
          className={`pt-icon-standard pt-icon-${question.options.length > 0 ? 'properties' : 'comment'}`}
        />
      </li>
    ))}
  </div>

export const QuestionType = styled.span`
  margin-left: 0.5em;
  color: #FFFFFF99;
`
