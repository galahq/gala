/**
 * @providesModule Question
 * @flow
 */

import React from 'react'
import styled from 'styled-components'

import { RadioGroup } from '@blueprintjs/core'
import type { IOptionProps } from '@blueprintjs/core'

import type { Question as QuestionT } from 'redux/state'

type Props = QuestionT & {
  selectedAnswer: string,
  correctAnswer?: string,
  onChange: (e: SyntheticInputEvent<*>) => void,
}
const Question = ({
  id,
  content,
  onChange,
  selectedAnswer,
  correctAnswer,
  options = [],
}: Props) =>
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
    <label className="bp3-label" htmlFor={id}>
      {content}
      <textarea
        name={id}
        className="bp3-input bp3-fill"
        dir="auto"
        disabled={!!correctAnswer}
        value={selectedAnswer}
        onChange={onChange}
      />
      {!!correctAnswer && <CorrectAnswer>{correctAnswer}</CorrectAnswer>}
    </label>
  )

export default Question

function toRadioProps (option: string, correctAnswer: ?string): IOptionProps {
  return {
    className: option === correctAnswer ? 'bp3-intent-success' : '',
    disabled: !!correctAnswer,
    label: option,
    value: option,
  }
}

const StyledRadioGroup = styled(RadioGroup)`
  & label.bp3-intent-success {
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
