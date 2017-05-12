/**
 * @providesModule QuizDetails
 * @flow
 */

import React from 'react'
import styled from 'styled-components'
import { List } from 'immutable'

import QuizCustomizer from './QuizCustomizer'
import { QuestionType } from './QuizCard'

import { Question } from './types'
import type { Quiz } from './types'

type Props = {
  quiz: Quiz,
  customQuestions: List<Question>,
  onChangeCustomQuestions: (List<Question>) => void,
  onDeselect: () => void,
}
const QuizDetails = (
  {
    quiz = { id: 'new', questions: [] },
    customQuestions = List(),
    onChangeCustomQuestions,
    onDeselect,
  }: Props
) => (
  <DetailsCard className="pt-card">
    <CloseLink onClick={onDeselect}>
      <span className="pt-icon-standard pt-icon-cross" />
    </CloseLink>
    <CardTitle>Quiz details</CardTitle>
    <ol>
      {quiz.questions.length > 0 && <SectionTitle>Base questions</SectionTitle>}
      {quiz.questions.map((question: Question, i: number) => (
        <li key={i}>
          {question.content}
          {question.options.length === 0
            ? <QuestionType className="pt-icon-standard pt-icon-comment" />
            : <OptionsList>
              {question.options.map((option: string, i: number) => (
                <li key={i}>{option}</li>
                ))}
            </OptionsList>}
        </li>
      ))}
      <SectionTitle>Custom questions</SectionTitle>
      <QuizCustomizer
        customQuestions={customQuestions}
        onChange={onChangeCustomQuestions}
      />
    </ol>
  </DetailsCard>
)

export default QuizDetails

const DetailsCard = styled.div`
  background-color: #446583;
  overflow: scroll;
  height: calc(100vh - 164px);
  position: relative;
`

const CardTitle = styled.h1`
  font-family: 'tenso';
  font-size: 17px;
`

const SectionTitle = styled.label`
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  line-height: 1;
  display: block;
  margin: 1em 0 0.25em -17px;
`

const OptionsList = styled.ul`
  margin: 0;
  font-size: 14px;

  & > li {
    display: inline;
    list-style: none;

    &:not(:first-child)::before {
      content: '—';
      margin: 0 0.5em;
    }
  }
`

const CloseLink = styled.a`
  position: absolute;
  top: 2px;
  right: 6px;
  color: #c3cbcd !important;

  &:hover {
    color: white !important;
  }
`
