/**
 * @providesModule QuizSelector
 * @flow
 */

import React from 'react'
import styled from 'styled-components'

import QuizCard from './QuizCard'

import type { ID, CustomizedQuiz, DraftQuestion } from './types'

type Props = {
  suggestedQuizzes: { [id: string]: CustomizedQuiz },
  customQuestions: { [id: string]: DraftQuestion[] },
  onSelect: (?ID) => void,
}
const QuizSelector = ({
  suggestedQuizzes,
  customQuestions,
  onSelect,
}: Props) => (
  <Container>
    <div className="bp3-callout bp3-icon-help" style={{ lineHeight: 1.2 }}>
      <h5>Assessment options</h5>
      See how well your students are learning. You can administer a
      comprehension quiz at the end of the case, and optionally pair it with an
      identical pretest.{' '}
      {Object.keys(suggestedQuizzes).length > 0
        ? 'Choose a base assessment from below, or start from scratch and design your own quiz.'
        : 'Think of a few multiple choice or short answer questions and they will be presented to your students before and after the case materials.'}
    </div>
    <TwoColumns>
      {Object.keys(suggestedQuizzes).map((id: string, i: number) => (
        <QuizCard
          key={id}
          {...suggestedQuizzes[id]}
          customQuestions={customQuestions[id]}
          onClick={onSelect}
        />
      ))}
      <QuizCard
        id="new"
        questions={[]}
        customQuestions={customQuestions['new'] || []}
        customized={true}
        onClick={onSelect}
      />
    </TwoColumns>
  </Container>
)

export default QuizSelector

const Container = styled.div`
  padding-bottom: 75px;
`

const TwoColumns = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: repeat(auto-fill, minmax(48%, 1fr));
  margin-top: 1em;
`
