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
  <Link
    className="pt-card pt-elevation-1 pt-interactive"
    tabIndex="0"
    role="button"
    onClick={() => onClick(id)}
    onKeyPress={acceptKeyboardClick}
  >
    {questions.length > 0 || customQuestions.length > 0 ? (
      <ol>
        <Questions questions={questions} />
        <Questions
          questions={customQuestions}
          sectionTitle="Custom Questions"
        />
      </ol>
    ) : (
      <NonIdealState title="Custom Assessment" visual="edit" />
    )}
  </Link>
)

export default QuizCard

const Questions = ({
  questions,
  sectionTitle,
}: {
  questions: QuestionT[],
  sectionTitle?: string,
}) =>
  questions.length > 0 ? (
    <React.Fragment>
      <SectionTitle>{sectionTitle}</SectionTitle>
      {questions.map((question: QuestionT, i: number) => (
        <Question key={i}>
          {question.content}
          <QuestionType
            className={`pt-icon-standard pt-icon-${
              question.options.length > 0 ? 'properties' : 'comment'
            }`}
          />
        </Question>
      ))}
    </React.Fragment>
  ) : null

export const Link = styled.a`
  color: white !important;
  background-color: #446583aa;

  .pt-non-ideal-state {
    height: auto;
    margin-top: 3em;
  }

  & .pt-non-ideal-state-icon .pt-icon {
    color: rgba(191, 204, 214, 0.5) !important;
  }
`

const Question = styled.li`
  & + & {
    margin-top: 0.5em;
  }
`

export const QuestionType = styled.span`
  margin-left: 0.5em;
  color: #ffffff99;
`
