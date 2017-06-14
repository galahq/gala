/**
 * @providesModule Question
 * @flow
 */

import React from 'react'

import { RadioGroup } from '@blueprintjs/core'
import type { IOptionProps } from '@blueprintjs/core'

import type { Question as QuestionT } from 'redux/state'

type Props = QuestionT & {
  selectedAnswer: string,
  onChange: (e: SyntheticInputEvent) => void,
}
const Question = ({
  id,
  content,
  onChange,
  selectedAnswer,
  options = [],
}: Props) =>
  options.length > 0
    ? <div style={{ marginBottom: 25 }}>
      <RadioGroup
        label={content}
        options={options.map(toRadioProps)}
        selectedValue={selectedAnswer}
        onChange={onChange}
      />
    </div>
    : <label className="pt-label" htmlFor={id}>
      {content}
      <textarea
        name={id}
        className="pt-input pt-fill"
        dir="auto"
        onChange={onChange}
      />
    </label>

export default Question

function toRadioProps (option: string): IOptionProps {
  return { disabled: false, label: option, value: option }
}
