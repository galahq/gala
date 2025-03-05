/**
 * @providesModule QuizCard
 * @flow
 */

import React from 'react'
import styled from 'styled-components'

import { NonIdealState } from '@blueprintjs/core'

import { acceptKeyboardClick } from 'shared/keyboard'
import { SectionTitle } from './QuizDetails'

import type { ID, CustomizedQuiz, DraftQuestion } from './types'

type Params = CustomizedQuiz & { onClick: (quizId: ID) => void }
const QuizCard = ({ id, questions, customQuestions, onClick }: Params) => (
  <Link
    className="bp3-card bp3-elevation-1 bp3-interactive"
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
  questions: DraftQuestion[],
  sectionTitle?: string,
}) =>
  questions.length > 0 ? (
    <>
      <SectionTitle>{sectionTitle}</SectionTitle>
      {questions.map((question, i) => (
        <Question key={i}>
          {question.content}
          <QuestionType
            className={`bp3-icon-standard bp3-icon-${
              question.options.length > 0 ? 'properties' : 'comment'
            }`}
          />
        </Question>
      ))}
    </>
  ) : null

export const Link = styled.a`
  color: white !important;
  background-color: #446583aa;

  .bp3-non-ideal-state {
    height: auto;
    margin-top: 3em;
  }

  & .bp3-non-ideal-state-icon .bp3-icon {
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
