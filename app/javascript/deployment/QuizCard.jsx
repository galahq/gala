/**
 * @providesModule QuizCard
 * 
 */

import React from 'react'
import styled from 'styled-components'

import { NonIdealState } from '@blueprintjs/core'

import { acceptKeyboardClick } from 'shared/keyboard'
import { SectionTitle } from './QuizDetails'


const QuizCard = ({ id, questions, customQuestions, onClick }) => (
  <Link
    className="bp6-card bp6-card bp6-elevation-1 bp6-elevation-1 bp6-interactive bp6-interactive"
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
      <NonIdealState title="Custom Assessment" icon="edit" />
    )}
  </Link>
)

export default QuizCard

const Questions = ({
  questions,
  sectionTitle,
}) =>
  questions.length > 0 ? (
    <>
      <SectionTitle>{sectionTitle}</SectionTitle>
      {questions.map((question, i) => (
        <Question key={i}>
          {question.content}
          <QuestionType
            className={`bp6-icon-standard bp6-icon-standard bp6-icon-${
              question.options.length > 0 ? 'properties' : 'comment'
            } bp6-icon-${question.options.length > 0 ? 'properties' : 'comment'}`}
          />
        </Question>
      ))}
    </>
  ) : null

export const Link = styled.a`
  color: white !important;
  background-color: #446583aa;

  .bp6-non-ideal-state,
  .bp6-non-ideal-state {
    height: auto;
    margin-top: 3em;
  }

  & .pt-non-ideal-state-icon .bp6-icon,
  & .bp4-non-ideal-state-icon .bp6-icon {
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
