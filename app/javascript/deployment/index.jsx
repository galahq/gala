/**
 * @providesModule Deployment
 * @flow
 */

import React from 'react'
import styled from 'styled-components'

import Toolbar from './Toolbar'

import { NonIdealState } from '@blueprintjs/core'

import type { Quiz, Question } from './types'

type Props = {
  caseData: Object,
  group: {
    name: string,
  },
  recommendedQuizzes: Quiz[],
}

const Deployment = ({ caseData, recommendedQuizzes }: Props) => {
  return (
    <div className="pt-dark" style={{ padding: '0 12px' }}>
      <div className="pt-callout pt-icon-help" style={{ lineHeight: 1.2 }}>
        <h5>Assessment options</h5>
        This is just placeholder text which will tell professors that they can administer a comprehension quiz at the end of the case, and pair it with an identical pretest. Choose a base assessment from below.
      </div>
      <TwoColumns>
        {recommendedQuizzes.map((quiz: Quiz, i: number) => (
          <QuizCard key={i} {...quiz} />
        ))}
        <QuizCard questions={[]} />
      </TwoColumns>
      <Toolbar withPretest withPosttest caseData={caseData} />
    </div>
  )
}

export default Deployment

const TwoColumns = styled.div`
  display: flex;
  flex-flow: row wrap;

  & > * {
    flex: 0 1 calc(50% - 0.5em);
    margin: 1em 0;

    &:nth-child(even) { margin-left: 0.5em; }
    &:nth-child(odd) { margin-right: 0.5em; }
  }
`

const QuizCard = ({ questions }: Quiz) => (
  <div
    className="pt-card pt-elevation-1 pt-interactive"
    style={{ backgroundColor: '#446583AA' }}
  >
    {questions.length > 0
      ? <ol>
        {questions.map((question: Question, i: number) => (
          <li key={i}>
            {question.content}
            <QuestionType
              className={`pt-icon-standard pt-icon-${question.options.length > 0 ? 'properties' : 'comment'}`}
            />
          </li>
          ))}
      </ol>
      : <NonIdealState title="Custom Assessment" visual="properties" />}
  </div>
)

const QuestionType = styled.span`
  margin-left: 0.5em;
  color: #FFFFFF99;
`
