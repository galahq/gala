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
  handleChange: (e: SyntheticInputEvent) => void,
}
const Question = ({
  id,
  content,
  handleChange,
  selectedAnswer,
  options = [],
}: Props) =>
  (options.length > 0
    ? <div style={{ marginBottom: 15 }}>
      <RadioGroup
        label={content}
        options={options.map(toRadioProps)}
        selectedValue={selectedAnswer}
        onChange={handleChange}
      />
    </div>
    : <label className="pt-label" htmlFor={id}>
      {content}
      <textarea
        name={id}
        className="pt-input pt-fill"
        dir="auto"
        onChange={handleChange}
      />
    </label>)

export default Question

function toRadioProps (option: string): IOptionProps {
  return { disabled: false, label: option, value: option }
}
