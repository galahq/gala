/**
 * @providesModule Question
 * 
 */

import React from 'react'
import styled from 'styled-components'

import { RadioGroup } from '@blueprintjs/core'


const Question = ({
  id,
  content,
  onChange,
  selectedAnswer,
  correctAnswer,
  options = [],
}) =>
  options.length > 0 ? (
    <div style={{ marginBottom: 25 }}>
      <StyledRadioGroup
        label={content}
        options={options.map(o => toRadioProps(o, correctAnswer))}
        selectedValue={selectedAnswer}
        onChange={onChange}
      />
    </div>
  ) : (
    <label className="bp6-label" htmlFor={id}>
      {content}
      <textarea
        name={id}
        className="bp6-input bp6-fill"
        dir="auto"
        disabled={!!correctAnswer}
        value={selectedAnswer}
        onChange={onChange}
      />
      {!!correctAnswer && <CorrectAnswer>{correctAnswer}</CorrectAnswer>}
    </label>
  )

export default Question

function toRadioProps (option, correctAnswer) {
  return {
    className: option === correctAnswer ? 'bp6-intent-success' : '',
    disabled: !!correctAnswer,
    label: option,
    value: option,
  }
}

const StyledRadioGroup = styled(RadioGroup)`
  & label.bp6-intent-success {
    color: #348a3b;
    font-weight: 600;
  }
`

const CorrectAnswer = styled.p`
  color: #348a3b;
  font-weight: 500;
  white-space: pre-wrap;
  font-size: 15px;
  line-height: 1.3;
`
