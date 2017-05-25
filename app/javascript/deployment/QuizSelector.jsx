/**
 * @providesModule QuizSelector
 * @flow
 */

import React from 'react'
import styled from 'styled-components'

import QuizCard from './QuizCard'

import type { ID, Quiz, Question } from './types'

type Props = {
  recommendedQuizzes: { [id: string]: Quiz },
  customQuestions: { [id: string]: Question[] },
  onSelect: (?ID) => void,
}
const QuizSelector = ({
  recommendedQuizzes,
  customQuestions,
  onSelect,
}: Props) => (
  <Container>
    <div className="pt-callout pt-icon-help" style={{ lineHeight: 1.2 }}>
      <h5>Assessment options</h5>
      This is just placeholder text which will tell professors that they can administer a comprehension quiz at the end of the case, and pair it with an identical pretest. Choose a base assessment from below.
    </div>
    <TwoColumns>
      {Object.keys(recommendedQuizzes).map((id: string, i: number) => (
        <QuizCard
          key={id}
          {...recommendedQuizzes[id]}
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
  padding-bottom: 60px;
`

const TwoColumns = styled.div`
  display: flex;
  flex-flow: row wrap;

  & > * {
    flex: 0 1 calc(50% - 0.5em);
    margin: 1em 0;

    &:nth-child(even) { margin-left: 0.5em; }
    &:nth-child(odd) { margin-right: 0.5em; }
    &:nth-child(n+3) { margin-top: 0 }
  }
`
