/**
 * @providesModule QuizDetails
 * 
 */

import React from 'react'
import styled from 'styled-components'

import QuizCustomizer from 'quiz/customizer'
import { QuestionType } from './QuizCard'


const QuizDetails = ({
  quiz = { id: 'new', questions: [], customQuestions: [], customized: true },
  customQuestions = [],
  onChangeCustomQuestions,
  onDeselect,
}) => (
  <DetailsCard className="bp6-card">
    <CloseLink onClick={onDeselect} />
    <CardTitle>Quiz details</CardTitle>
    <QuestionsList>
      {quiz.questions.length > 0 && <SectionTitle>Base questions</SectionTitle>}
      {quiz.questions.map((question, i) => (
        <li key={i}>
          {question.content}
          {question.options.length === 0 ? (
            <QuestionType className="bp6-icon-standard bp6-icon-comment" />
          ) : (
            <OptionsList>
              {question.options.map((option, i) => {
                const correct = question.correctAnswer === option

                return (
                  <li key={i}>
                    <Option correct={correct}>
                      {correct && <span className="bp6-icon bp6-icon-tick" />}
                      {option}
                    </Option>
                  </li>
                )
              })}
            </OptionsList>
          )}
        </li>
      ))}
      <SectionTitle>Custom questions</SectionTitle>
      <QuizCustomizer
        customQuestions={customQuestions}
        onChange={onChangeCustomQuestions}
      />
    </QuestionsList>
  </DetailsCard>
)

export default QuizDetails

const DetailsCard = styled.div`
  background-color: #446583;
  margin-bottom: 75px;
  overflow: scroll;
  position: relative;
`

const CardTitle = styled.h2`
  font-family: ${p => p.theme.sansFont};
  font-size: 17px;
  margin-bottom: 0.5em;
`

export const SectionTitle = styled.h3`
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  line-height: 1;
  display: block;
  margin: 1.5em 0 0.25em -17px;
`

const QuestionsList = styled.ol`
  & > li + li {
    margin-top: 1em;
  }
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

const Option = styled.span.attrs({
  className: p => `bp6-tag ${p.correct ? 'bp6-intent-success' : ''}`,
})`
  display: inline;
  .bp6-icon,
  .bp6-icon {
    margin-right: 0.25em;
  }
`

const CloseLink = styled.button.attrs({
  className: 'bp6-button bp6-minimal bp6-icon-cross',
  'aria-label': 'Return to quiz selection.',
})`
  position: absolute;
  top: 2px;
  right: 6px;
  color: #c3cbcd !important;

  &:hover {
    color: white !important;
  }
`
