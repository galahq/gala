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
    <label className="pt-label" htmlFor={id}>
      {content}
      <textarea
        name={id}
        className="pt-input pt-fill"
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
    className: option === correctAnswer ? 'pt-intent-success' : '',
    disabled: !!correctAnswer,
    label: option,
    value: option,
  }
}

const StyledRadioGroup = styled(RadioGroup)`
  & label.pt-intent-success {
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
